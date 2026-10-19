"use client"
import { useState } from "react"

export default function AdminUpload() {
  const [preview, setPreview] = useState("")

  return (
    <main className="min-h-screen bg-black text-white p-6 font-mono">
      <h1 className="text-[#00FF88] text-2xl">موقع الرفع السري - ليك انت بس</h1>
      
      <div className="max-w-[500px] mt-10 border border-[#00FF88]/20 bg-[#0A0A0F] rounded-2xl p-6 space-y-4">
        
        <div>
          <label className="text-xs text-white/50">1. اختار الصورة (صور الموت)</label>
          <input type="file" accept="image/*" onChange={(e)=>{
            const file = e.target.files?.[0]
            if(file) setPreview(URL.createObjectURL(file))
          }} className="mt-2 w-full bg-[#111] border border-white/10 rounded-xl p-3 text-sm" />
          {preview && <img src={preview} className="mt-4 rounded-xl w-full h-[200px] object-cover" />}
        </div>

        <div>
          <label className="text-xs text-white/50">2. اختار القسم</label>
          <select className="mt-2 w-full bg-[#111] border border-white/10 rounded-xl p-3 text-sm">
            <option>DESIGN</option>
            <option>BOT</option>
            <option>CODE</option>
            <option>HACK</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-white/50">3. السعر (مش هيظهر في الموقع - ليك انت بس)</label>
          <input placeholder="مثلا: 300 جنيه" className="mt-2 w-full bg-[#111] border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#00FF88]" />
        </div>

        <button className="w-full py-3 rounded-xl bg-[#00FF88] text-black font-bold mt-4">
          رفع - هيظهر في الموقع العلني من غير سعر
        </button>
      </div>
    </main>
  )
}
