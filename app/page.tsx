import Navbar from "@/components/Navbar"
import ChatBot from "@/components/ChatBot"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05050A] text-white overflow-hidden">
      <Navbar />

      {/* خلفية هكر */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FF8808_1px,transparent_1px),linear-gradient(to_bottom,#00FF8808_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#A855F7]/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00F0FF]/15 blur-[150px] rounded-full"></div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-20 grid md:grid-cols-2 gap-12 items-center">
        
        {/* الشمال */}
        <div className="space-y-6">
          <div className="inline-flex gap-2 items-center px-3 py-1 rounded-full border border-[#00FF88]/20 bg-[#00FF88]/5 font-mono text-[11px] text-[#00FF88]">
            <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse"></span>
            SYSTEM ONLINE - @Shqawa_Pro
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter">
            <span className="text-white">نبرمج</span><br/>
            <span className="text-[#00FF88]">نهكر</span><br/>
            <span className="text-[#00F0FF]">نصمم</span><br/>
            <span className="text-[#A855F7]">بوتات.</span>
          </h1>

          <p className="text-white/50 font-mono text-sm max-w-[400px] leading-relaxed">
            &gt; موقع شقاوة مش موقع عادي، ده نظام كامل. كل حاجة بتتبني من جيت هب وتتعرض هنا اوتوماتيك.
          </p>

          <div className="flex gap-3 pt-4">
            <Link href="/work" className="px-6 py-3 rounded-full bg-white text-black font-bold font-mono text-sm hover:bg-[#00FF88] transition">استعرض الشغل →</Link>
            <Link href="/store" className="px-6 py-3 rounded-full border border-white/10 text-white font-mono text-sm hover:border-[#A855F7]/50 hover:text-[#A855F7] transition">المتجر</Link>
          </div>
        </div>

        {/* اليمين - الشات */}
        <div className="flex justify-center">
          <ChatBot />
        </div>

      </section>
    </main>
  )
}
