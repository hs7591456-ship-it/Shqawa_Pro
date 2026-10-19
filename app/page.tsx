"use client"
import { useState } from "react"
import Link from "next/link"

export default function Home(){
  const [msgs, setMsgs] = useState([{role:"bot", text:"ازيك يا بطل 😎 انا شقاوة بوت.. عايز تدخل المتجر ولا تسألني عن حاجة؟"}])
  const [input, setInput] = useState("")

  const send = async ()=>{
    if(!input) return
    setMsgs([...msgs, {role:"user", text:input}])
    const res = await fetch("/api/chat", {method:"POST", body: JSON.stringify({message: input})})
    const data = await res.json()
    setMsgs(m=>[...m, {role:"bot", text: data.reply}])
    setInput("")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#05050A] via-[#0A0A1A] to-[#0F0A1F]">
      <div className="w-full max-w-[500px] bg-[#0A0A0F]/80 backdrop-blur border border-white/10 rounded-[24px] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <span className="font-mono text-[#00FF88]">SHQAWA_AI v2.0 - online</span>
          <Link href="/shop" className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs">ادخل المتجر 🛒</Link>
        </div>
        <div className="h-[380px] overflow-auto p-4 space-y-3">
          {msgs.map((m,i)=><div key={i} className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role==="bot" ? "bg-white/10 text-white" : "bg-[#00FF88] text-black ml-auto"}`}>{m.text}</div>)}
        </div>
        <div className="p-3 flex gap-2 border-t border-white/5">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()} placeholder="اسأل شقاوة..." className="flex-1 bg-black border border-white/10 rounded-full px-4 py-3 text-sm outline-none"/>
          <button onClick={send} className="px-6 rounded-full bg-[#A855F7] font-bold">ارسال</button>
        </div>
      </div>
      <Link href="/shop" className="mt-8 px-10 py-4 rounded-full bg-gradient-to-r from-[#00FF88] to-[#00F0FF] text-black font-black text-lg">ادخل المتجر كامل - STORE -</Link>
    </main>
  )
}
