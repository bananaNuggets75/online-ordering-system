"use client";

import { Poppins } from "next/font/google";
import Sidebar from "@/components/SideBar";
import AdminNavbar from "@/components/AdminNavbar";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext"; 
import { Toaster } from "react-hot-toast"; 
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <AuthProvider>  
          <CartProvider>
            <LayoutContent>{children}</LayoutContent> 
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

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  // Show AdminNavbar on admin pages except /admin/login
  const isAdminPage = pathname.startsWith("/admin/") && pathname !== "/admin/login";

  return (
    <>
      {isAdminPage && isAdmin && <AdminNavbar />} 
      {!isAdminPage && <Sidebar />} 

      {children}
    </>
  );
}
