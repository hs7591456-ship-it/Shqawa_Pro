import Navbar from "@/components/Navbar"
import Link from "next/link"
const cats = [
  {id:"design", name:"التصاميم", color:"#A855F7", emoji:"🎨"},
  {id:"code", name:"البرمجة", color:"#00F0FF", emoji:"💻"},
  {id:"apps", name:"التطبيقات", color:"#00FF88", emoji:"📱"},
  {id:"bots", name:"البوتات", color:"#FFB800", emoji:"🤖"},
]
export default function Shop(){
  return <main className="min-h-screen bg-[#05050A]"><Navbar/>
    <div className="max-w-[1100px] mx-auto p-6">
      <h1 className="text-3xl font-black mt-6">اختار القسم</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {cats.map(c=><Link key={c.id} href={`/shop/${c.id}`} className="h-[180px] rounded-[24px] border border-white/10 p-6 flex flex-col justify-between hover:-translate-y-1 transition" style={{background: `${c.color}15`}}>
          <span className="text-4xl">{c.emoji}</span>
          <span className="font-bold text-xl" style={{color:c.color}}>{c.name}</span>
        </Link>)}
      </div>
    </div>
  </main>
          }
