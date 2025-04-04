"use client"; 

import Sidebar from "@/components/SideBar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast"; 
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  // Hide sidebar on admin pages and form pages
  const isHiddenPage = pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/login");

  return (
    <html lang="en">
      <body>
        <AuthProvider>  
          <CartProvider>
            {!isHiddenPage && <Sidebar />} 
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                  padding: "10px",
                },
              }} 
              reverseOrder={false} 
            /> 
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
