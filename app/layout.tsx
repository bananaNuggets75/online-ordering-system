import Sidebar from "@/components/SideBar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Sidebar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
