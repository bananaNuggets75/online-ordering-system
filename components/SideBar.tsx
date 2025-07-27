"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { 
  Menu, 
  X, 
  User, 
  LogIn, 
  Home, 
  ShoppingCart, 
  Package, 
  LogOut,
  UserPlus
} from "lucide-react";

const SideBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    {
      href: "/menu",
      icon: Home,
      label: "Menu",
      description: "Browse our delicious items"
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      description: "Review your order",
      badge: cartItemCount > 0 ? cartItemCount : undefined
    },
    {
      href: "/order-status",
      icon: Package,
      label: "Order Status", 
      description: "Track your orders"
    }
  ];

  return (
    <>
      {/* Burger Menu Button */}
      <button 
        className="burger-menu"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Food Dae
            </h2>
            <p className="text-sm text-gray-600">Delicious snacks & drinks</p>
          </div>
          <button 
            className="close-btn p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Section */}
        <div className="p-6 border-b border-orange-100">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Welcome back!</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Sign in to track orders and save favorites</p>
              <div className="flex gap-2">
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 text-center"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors text-center"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
                >
                  <div className="relative">
                    <item.icon className="w-6 h-6" />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-sm text-gray-500 group-hover:text-orange-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </li>
            ))}

            {/* Profile Link (only if logged in) */}
            {user && (
              <li>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-200 group"
                >
                  <User className="w-6 h-6" />
                  <div className="flex-1">
                    <div className="font-semibold">Profile</div>
                    <div className="text-sm text-gray-500 group-hover:text-orange-500">
                      Manage your account
                    </div>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-orange-100">
          {user ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          ) : (
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                © 2024 Food Dae. All rights reserved.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;