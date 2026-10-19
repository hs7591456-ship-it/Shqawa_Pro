"use client"
import { createContext, useContext, useState, useEffect } from "react"
const CartContext = createContext<any>(null)
export function CartProvider({children}: any){
  const [cart, setCart] = useState<any[]>([])
  useEffect(()=>{ const s=localStorage.getItem("shqawa-cart"); if(s) setCart(JSON.parse(s)) },[])
  useEffect(()=>{ localStorage.setItem("shqawa-cart", JSON.stringify(cart)) },[cart])
  const add = (p:any)=> setCart([...cart, p])
  const clear = ()=> setCart([])
  return <CartContext.Provider value={{cart, add, clear, count: cart.length}}>{children}</CartContext.Provider>
}
export const useCart = ()=> useContext(CartContext)
