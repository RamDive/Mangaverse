import axios from 'axios';
import Link from 'next/link';
export async function getServerSideProps(ctx){
  const slug = ctx.params.slug;
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const r = await axios.get(`${api}/mangas/${slug}`).catch(()=>null);
  return { props: { manga: r? r.data : null } }
}
export default function MangaPage({manga}){
  if(!manga) return <div className="p-6">Not found</div>;
  return (
    <div className="min-h-screen p-6 bg-[#0B0F1A] text-white">
      <div className="flex gap-6">
        <img src={manga.cover_url} className="w-48 rounded"/>
        <div>
          <h2 className="text-2xl font-bold">{manga.title}</h2>
          <p className="text-sm text-gray-400">by {manga.author} • {manga.status}</p>
          <p className="mt-4">{manga.description}</p>
          <div className="mt-4">
            {manga.chapters.map(c=> <Link key={c.id} href={`/reader/${c.id}`}><a className="inline-block mr-2 px-3 py-1 bg-[#7C3AED] rounded">Read Chapter {c.number}</a></Link>)}
          </div>
        </div>
      </div>
    </div>
  )
}
