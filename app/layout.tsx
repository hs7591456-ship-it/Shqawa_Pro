import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
export const metadata = { title: "SHQAWA STORE" }
export default function RootLayout({children}: any){
  return <html lang="ar" dir="rtl"><body className="bg-[#07070D] text-white"><CartProvider>{children}</CartProvider></body></html>
}
