require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function signToken(user){ return jwt.sign({ uid: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' }); }
function verifyAuth(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'no token'});
  const token = auth.split(' ')[1];
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data; next();
  }catch(e){ return res.status(401).json({error:'invalid token'}); }
}

// Health
app.get('/api/v1/health', (req,res)=>res.json({ok:true}));

// Auth: signup
app.post('/api/v1/auth/signup', async (req,res)=>{
  const { email, username, password } = req.body;
  if(!email || !username || !password) return res.status(400).json({error:'missing fields'});
  const hashed = await bcrypt.hash(password, 10);
  try{
    const r = await pool.query('INSERT INTO users(email,password_hash,username,created_at,updated_at) VALUES($1,$2,$3,now(),now()) RETURNING id,email,username,avatar_url', [email, hashed, username]);
    const user = r.rows[0];
    const token = signToken(user);
    return res.status(201).json({user, token});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'signup failed'});
  }
});

// Auth: login
app.post('/api/v1/auth/login', async (req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({error:'missing fields'});
  try{
    const r = await pool.query('SELECT id,email,username,password_hash,avatar_url FROM users WHERE email=$1', [email]);
    if(r.rowCount===0) return res.status(400).json({error:'invalid credentials'});
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(400).json({error:'invalid credentials'});
    const token = signToken(user);
    delete user.password_hash;
    return res.json({user, token});
  }catch(e){ console.error(e); return res.status(500).json({error:'login failed'}); }
});

// List mangas
app.get('/api/v1/mangas', async (req,res)=>{
  const q = req.query.q || '';
  try{
    const r = await pool.query("SELECT id,slug,title,description,cover_url,author,status,tags FROM mangas WHERE title ILIKE $1 OR $1='' LIMIT 50", [`%${q}%`]);
    return res.json({items:r.rows, total:r.rowCount});
  }catch(e){ console.error(e); return res.status(500).json({error:'failed fetching'}); }
});

// Manga detail including chapters
app.get('/api/v1/mangas/:slug', async (req,res)=>{
  const { slug } = req.params;
  try{
    const m = await pool.query('SELECT * FROM mangas WHERE slug=$1', [slug]);
    if(m.rowCount===0) return res.status(404).json({error:'not found'});
    const manga = m.rows[0];
    const ch = await pool.query('SELECT id,number,title,slug FROM chapters WHERE manga_id=$1 ORDER BY number', [manga.id]);
    manga.chapters = ch.rows;
    return res.json(manga);
  }catch(e){ console.error(e); return res.status(500).json({error:'failed'}); }
});

// Chapter pages (returns pages array)
app.get('/api/v1/chapters/:id/pages', async (req,res)=>{
  const { id } = req.params;
  try{
    const r = await pool.query('SELECT pages FROM chapters WHERE id=$1', [id]);
    if(r.rowCount===0) return res.status(404).json({error:'not found'});
    return res.json({pages: r.rows[0].pages});
  }catch(e){ console.error(e); return res.status(500).json({error:'failed'}); }
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('API running on', port));
