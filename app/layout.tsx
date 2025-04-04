"use client"; 

import Sidebar from "@/components/SideBar";
import AdminNavbar from "@/components/AdminNavbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast"; 
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdminPage = pathname.startsWith("/admin");

  // Redirect non-admin users away from admin pages
  useEffect(() => {
    if (!loading) {
      if (isAdminPage && !isAdmin) {
        router.replace("/"); // Redirect non-admins to homepage
      }
    }
  }, [loading, isAdmin, isAdminPage, router]);

  if (loading) return <p>Loading...</p>; // Show a loading indicator while checking auth

  return (
    <div>
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
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> 
          <CartProvider>
            <LayoutContent>{children}</LayoutContent>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
