import Sidebar from "@/components/SideBar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast"; // Import Toaster

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Sidebar />
          {children}
          <Toaster position="top-right" reverseOrder={false} /> {/* Add Toaster */}
        </CartProvider>
      </body>
    </html>
  );
}
