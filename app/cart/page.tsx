"use client"
import { useCart } from "@/lib/cart-context"
export default function Cart(){
  const {cart, clear} = useCart()
  const order = async ()=>{
    await fetch("/api/order", {method:"POST", body: JSON.stringify({cart})})
    alert("تم ارسال الطلب لشقاوة على البوت 🤖")
    clear()
  }
  return <main className="min-h-screen p-6 max-w-[600px] mx-auto">
    <h1 className="text-2xl font-bold">السلة ({cart.length})</h1>
    <div className="mt-6 space-y-3">
      {cart.map((p:any,i:number)=><div key={i} className="flex gap-3 bg-[#111] p-3 rounded-xl"><img src={p.image_url} className="w-16 h-16 rounded-lg object-cover"/><span>{p.name}</span></div>)}
    </div>
    {cart.length>0 && <button onClick={order} className="mt-8 w-full py-4 rounded-full bg-[#00FF88] text-black font-black">اطلب دلوقتي - البوت هيبعتلي</button>}
  </main>
}
