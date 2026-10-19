"use client"
import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-[#00FF88]/10 bg-[#05050A]/80 backdrop-blur-2xl">
      <div className="max-w-[1200px] mx-auto px-6 h-[65px] flex items-center justify-between">
        
        {/* اللوجو */}
        <Link href="/" className="font-mono font-black tracking-tighter flex items-center gap-2">
          <span className="text-[#00FF88] text-xl">_SHQAWA</span>
          <span className="text-white text-xl">_PRO</span>
          <span className="w-2 h-5 bg-[#00FF88] animate-pulse ml-1"></span>
        </Link>

        {/* اللينكات - ديسكتوب */}
        <div className="hidden md:flex items-center gap-8 font-mono text-[13px]">
          <Link href="/" className="text-white/60 hover:text-[#00FF88] transition">./home</Link>
          <Link href="/work" className="text-white/60 hover:text-[#00F0FF] transition">./work</Link>
          <Link href="/store" className="text-white/60 hover:text-[#A855F7] transition">./store</Link>
          <Link href="/chat" className="px-4 py-2 rounded-full bg-[#00FF88] text-black font-bold hover:bg-[#00F0FF] hover:shadow-[0_0_20px_#00F0FF] transition-all">
            [CHAT_LIVE]
          </Link>
        </div>

        {/* موبايل */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-[#00FF88] text-xl">
          {open ? 'x' : '≡'}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#00FF88]/10 bg-black p-6 flex flex-col gap-4 font-mono">
          <Link href="/" onClick={()=>setOpen(false)} className="text-[#00FF88]">./home</Link>
          <Link href="/work" onClick={()=>setOpen(false)} className="text-[#00F0FF]">./work</Link>
          <Link href="/store" onClick={()=>setOpen(false)} className="text-[#A855F7]">./store</Link>
          <Link href="/chat" onClick={()=>setOpen(false)} className="bg-[#00FF88] text-black p-3 rounded-xl text-center font-bold">[CHAT_LIVE]</Link>
        </div>
      )}
    </nav>
  )
}
