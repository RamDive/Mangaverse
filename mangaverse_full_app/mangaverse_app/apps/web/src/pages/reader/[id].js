import axios from 'axios';
import { useEffect, useState } from 'react';
export default function Reader({}){
  const [pages, setPages] = useState(null);
  useEffect(()=>{
    const id = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null;
    if(!id) return;
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    axios.get(`${api}/chapters/${id}/pages`).then(r=>setPages(r.data.pages)).catch(()=>setPages([]));
  },[]);
  if(pages===null) return <div className="p-6">Loading...</div>;
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-3xl p-4">
        {pages.length===0 ? <div>No pages</div> : pages.map((p,i)=> <img key={i} src={p} alt={`page-${i}`} className="mb-4 w-full"/>)}
      </div>
    </div>
  )
}
