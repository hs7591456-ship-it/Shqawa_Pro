import Navbar from "@/components/Navbar"

const works = [
  { title: "بوت تيليجرام مبيعات", tag: "BOT", color: "#00F0FF", desc: "بوت بيرد اوتوماتيك ويبعت للعميل على @Shqawa_Pro" },
  { title: "موقع شركة فخم", tag: "CODE", color: "#00FF88", desc: "Next.js + Tailwind + انيميشن خرافي" },
  { title: "هوية بصرية كاملة", tag: "DESIGN", color: "#A855F7", desc: "لوجو + الوان + سوشيال ميديا" },
  { title: "سكريبت هكر اخلاقي", tag: "HACK", color: "#FF3B30", desc: "فحص ثغرات للمواقع - للتعلم فقط" },
]

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-[#05050A]">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <h1 className="font-mono text-3xl text-white mb-2">/work --list</h1>
        <p className="font-mono text-white/40 text-sm mb-10"> &gt; كل الملفات بتتسحب من جيت هب اوتوماتيك</p>

        <div className="grid md:grid-cols-2 gap-4">
          {works.map((w,i) => (
            <div key={i} className="group relative border border-white/5 bg-[#0A0A0F] rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="absolute top-6 right-6 text-[10px] font-mono px-2 py-1 rounded-full border" style={{color: w.color, borderColor: `${w.color}30`, background: `${w.color}10`}}>
                {w.tag}
              </div>
              <h3 className="text-white font-bold text-xl mt-8 mb-2">{w.title}</h3>
              <p className="text-white/40 font-mono text-sm">{w.desc}</p>
              <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#00FF88]/30 transition-all"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
