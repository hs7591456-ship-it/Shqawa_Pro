"use client"
import { useState } from "react"

const BOT_REPLIES = [
  "أهلاً بيك في نظام SHQAWA_PRO 👑",
  "أنا السكرتير الذكي بتاع كريم... تحب تشوف [1] شغل البرمجة [2] تصميمات [3] بوتات جاهزة ولا [4] تكلم كريم مباشر؟",
  "اكتب رقم الاختيار او ابعت رسالتك وهتتحول فوراً لـ @Shqawa_Pro"
]

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: BOT_REPLIES[0] },
    { role: "bot", text: BOT_REPLIES[1] },
  ])

  const handleSend = async (text: string) => {
    if(!text) return
    setMessages(prev => [...prev, { role: "user", text }])
    
    // يبعتلك على التيليجرام
    fetch(`https://api.telegram.org/botYOUR_TOKEN/sendMessage?chat_id=@Shqawa_Pro&text=رسالة جديدة من الموقع: ${text}`)

    // رد اوتوماتيك
    setTimeout(() => {
      if(text.includes("4") || text.includes("كريم")){
        setMessages(prev => [...prev, { role: "bot", text: "تمام، تم تحويلك لـ كريم شخصياً على @Shqawa_Pro وهيرد عليك حالاً... 🚀" }])
      } else {
        setMessages(prev => [...prev, { role: "bot", text: "فهمتك، ثواني بعرضلك الشغل..." }])
      }
    }, 800)
  }

  return (
    <div className="w-full max-w-[500px] rounded-[20px] overflow-hidden border border-[#00FF88]/30 bg-[#08080A] shadow-[0_0_50px_rgba(0,255,136,0.15)]">
      {/* الهيدر الهكر */}
      <div className="h-[50px] bg-gradient-to-r from-[#00FF88]/20 via-[#00F0FF]/20 to-[#A855F7]/20 border-b border-white/10 flex items-center px-4 justify-between backdrop-blur">
        <span className="font-mono text-xs text-[#00FF88]">● shqawa_bot.exe - connected to @Shqawa_Pro</span>
        <span className="text-[10px] bg-[#00FF88] text-black px-2 py-1 rounded-full font-bold">LIVE</span>
      </div>

      {/* الرسايل */}
      <div className="h-[380px] overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#00FF8811_1px,transparent_1px)] bg-[size:20px_20px]">
        {messages.map((m,i) => (
          <div key={i} className={`p-3 rounded-xl text-sm font-mono max-w-[85%] ${m.role==='bot' ? 'bg-[#111] border border-[#00F0FF]/20 text-[#00F0FF]' : 'bg-[#00FF88] text-black ml-auto'}`}>
            {m.text}
          </div>
        ))}
      </div>

      {/* الانبوت */}
      <div className="p-3 bg-black border-t border-[#00FF88]/20 flex gap-2">
        <input 
          id="chatInput"
          placeholder="اكتب هنا... >"
          className="flex-1 bg-[#111] border border-white/10 rounded-full px-4 py-2.5 outline-none text-white font-mono text-sm focus:border-[#00FF88]/50"
          onKeyDown={(e) => {
            if(e.key === 'Enter'){
              handleSend((e.target as HTMLInputElement).value)
              ;(e.target as HTMLInputElement).value = ''
            }
          }}
        />
        <button 
          onClick={() => {
            const input = document.getElementById('chatInput') as HTMLInputElement
            handleSend(input.value)
            input.value = ''
          }}
          className="bg-[#00FF88] text-black px-5 rounded-full font-bold font-mono hover:bg-[#00F0FF] transition"
        >SEND</button>
      </div>
    </div>
  )
  }
