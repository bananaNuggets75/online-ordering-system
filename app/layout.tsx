"use client";

import SideBar from "@/components/SideBar";
import AdminNavbar from "@/components/AdminNavbar"; 
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext"; 
import { Toaster } from "react-hot-toast"; 
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Food Dae - Delicious Snacks & Drinks</title>
        <meta name="description" content="Order your favorite croffles, churro donuts, and chewy soda!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <AuthProvider>  
          <CartProvider>
            <LayoutContent>{children}</LayoutContent> 
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  fontSize: "14px",
                  fontWeight: "500",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  maxWidth: "400px",
                },
                success: {
                  style: {
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                  },
                },
                error: {
                  style: {
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                  },
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
  const { isAdmin, loading, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading spinner during auth check
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Determine if we're on admin pages
  const isAdminPage = pathname.startsWith("/admin/");
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isHomePage = pathname === "/";

  // Show AdminNavbar for authenticated admin users (except login page)
  const showAdminNav = isAdminPage && isAdmin && pathname !== "/admin/login";
  
  // Show Sidebar for regular users (not on auth pages or admin pages)
  const showSideBar = !isAuthPage && !isAdminPage && !isHomePage;

  return (
    <div className="min-h-screen">
      {showAdminNav && <AdminNavbar />}
      {showSideBar && <SideBar />}
      
      <main className={`${showAdminNav ? 'pt-16' : ''} ${showSideBar ? 'pl-0' : ''}`}>
        {children}
      </main>
    </div>
  );
}