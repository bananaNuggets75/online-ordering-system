"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const AdminNavbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      {/* Left: Empty (keeps balance in flex layout) */}
      <div className="w-1/4"></div>

      {/* Center: Navigation Links */}
      <div className="flex-1 flex justify-center space-x-8 text-lg font-semibold">
        <Link href="/admin/dashboard" className="hover:text-gray-200">
          📊 Admin Dashboard
        </Link>
        <Link href="/admin/menu-items" className="hover:text-gray-200">
          🍽 Menu Items
        </Link>
        <Link href="/admin/orders" className="hover:text-gray-200">
          📦 Orders
        </Link>
      </div>

      {/* Right: Logout Button */}
      <div className="w-1/4 flex justify-end">
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded text-white hover:bg-red-700"
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
