"use client";

import React, { useState } from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
      </div>
    </>
  );
};

export default Sidebar;
