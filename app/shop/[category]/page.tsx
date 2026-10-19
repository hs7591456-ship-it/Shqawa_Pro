import { supabase } from "@/lib/supabase"
import AddToCartBtn from "./AddBtn"
export default async function CatPage({params}: any){
  const {data} = await supabase.from("products").select("id, name, image_url, description").eq("category", params.category)
  return <main className="min-h-screen bg-[#05050A] p-6">
    <h1 className="font-mono text-[#00FF88]">/{params.category} - {data?.length || 0} products</h1>
    <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-[1100px] mx-auto">
      {data?.map((p:any)=><div key={p.id} className="bg-[#0A0A0F] border border-white/5 rounded-[20px] p-3">
        <img src={p.image_url} className="w-full h-[220px] object-cover rounded-xl"/>
        <h3 className="font-bold mt-3">{p.name}</h3>
        <p className="text-white/40 text-xs mt-1">{p.description}</p>
        <AddToCartBtn product={p}/>
      </div>)}
    </div>
  </main>
}
