import Navbar from "@/components/Navbar"
import Link from "next/link"

const products = [
  { name: "شغل موت جديد", img: "/uploads/1.jpg", category: "DESIGN" },
  { name: "بوت فاجر", img: "/uploads/2.jpg", category: "BOT" },
]

export default function StorePage() {
  return (
    <main className="min-h-screen bg-[#05050A]">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <h1 className="font-mono text-3xl text-white">/store</h1>
        
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {products.map((p,i) => (
            <div key={i} className="rounded-[20px] bg-[#0A0A0F] border border-white/5 p-3">
              <div className="h-[250px] bg-[#111] rounded-xl flex items-center justify-center text-white/20 font-mono text-xs">
                صورة المنتج - {p.img}
              </div>
              <div className="p-3">
                <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-[#00FF88]/10 text-[#00FF88]">{p.category}</span>
                <h3 className="text-white font-bold mt-2">{p.name}</h3>
                <Link href="https://t.me/Shqawa_Pro" className="mt-4 block text-center py-2.5 rounded-full bg-white text-black font-bold font-mono text-sm">
                  اسأل على السعر
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
