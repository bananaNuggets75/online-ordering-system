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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
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

  // Admin pages get the AdminNavbar (when signed in as admin) instead of the
  // customer sidebar. The login page shows neither (admin isn't signed in yet).
  const isAdminPage = pathname.startsWith("/admin/");

  return (
    <>
      {isAdminPage && isAdmin && <AdminNavbar />} 
      {!isAdminPage && <Sidebar />} 

      {children}
    </>
  );
}
