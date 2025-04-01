"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Burger Icon */}
      <button className="burger-menu" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
        <nav>
          <ul>
            {user ? (
              <li>
                <Link href="/profile" onClick={() => setIsOpen(false)}>👤 Profile</Link>
              </li>
            ) : (
              <li>
                <Link href="/login" onClick={() => setIsOpen(false)}>🔑 Login</Link>
              </li>
            )}
            <li>
              <Link href="/menu" onClick={() => setIsOpen(false)}>🏠 Menu</Link>
            </li>
            <li>
              <Link href="/cart" onClick={() => setIsOpen(false)}>🛒 Cart</Link>
            </li>
            <li>
              <Link href="/order-status" onClick={() => setIsOpen(false)}>📦 Order Status</Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button (Always at the Bottom) */}
        {user && (
          <div className="sidebar-footer">
            <button onClick={logout} className="logout-btn">🚪 Logout</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
