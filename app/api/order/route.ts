export async function POST(req: Request){
  const {cart} = await req.json()
  const text = `🔥 اوردر جديد من المتجر:\n${cart.map((p:any)=>`- ${p.name}`).join("\n")}`
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({chat_id: process.env.OWNER_CHAT_ID, text})})
  return Response.json({ok:true})
}
