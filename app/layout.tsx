import Sidebar from "@/components/SideBar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Sidebar />
          
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
          }} reverseOrder={false} /> 
        </CartProvider>
      </body>
    </html>
  );
}
