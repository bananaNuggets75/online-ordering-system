"use client"; 

import Sidebar from "@/components/SideBar";
import AdminNavbar from "@/components/AdminNavbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast"; 
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  // Show Sidebar for Users, Show Navbar for Admins
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body>
        <AuthProvider> 
          <CartProvider>
            {isAdminPage ? <AdminNavbar /> : <Sidebar />}
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
