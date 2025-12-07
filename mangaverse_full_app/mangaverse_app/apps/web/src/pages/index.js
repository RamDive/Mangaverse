import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';

const fetcher = url => axios.get(url).then(r=>r.data);

export default function Home(){
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const { data, error } = useSWR(api + '/mangas', fetcher);
  if(error) return <div>Failed to load</div>;
  if(!data) return <div>Loading...</div>;
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">MangaVerse</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.items.map(m => (
          <Link key={m.id} href={`/manga/${m.slug}`}><a className="block bg-[#0F1724] p-3 rounded-lg">
            <img src={m.cover_url || '/favicon.ico'} alt={m.title} className="w-full h-40 object-cover rounded"/>
            <div className="mt-2 font-semibold">{m.title}</div>
            <div className="text-sm text-gray-400">{m.author}</div>
          </a></Link>
        ))}
      </div>
    </div>
  )
}
