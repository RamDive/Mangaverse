require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed(){
  const pwd = await bcrypt.hash('password123', 10);
  await pool.query("INSERT INTO users(email,password_hash,username,bio,created_at,updated_at) VALUES($1,$2,$3,$4,now(),now()) ON CONFLICT (email) DO NOTHING", ['alice@example.com', pwd, 'alice', 'I love shonen!']);
  await pool.query("INSERT INTO mangas(slug,title,description,cover_url,author,status,tags,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,now(),now()) ON CONFLICT (slug) DO NOTHING", ['samurai-dawn','Samurai Dawn','A rising samurai in a neon world','/images/covers/samurai-dawn.jpg','K. Haru','ongoing', ['Action','Seinen']]);
  console.log('seeded sample data'); process.exit(0);
}

seed().catch(e=>{ console.error(e); process.exit(1); });
