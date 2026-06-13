"use client";

import React, { useState } from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Burger icon */}
      <button className="burger-menu" onClick={() => setIsOpen(!isOpen)} aria-label="Open menu">
        <i className="fas fa-bars" />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close menu">
          <i className="fas fa-xmark" />
        </button>
        <nav>
          <ul>
            <li>
              <Link href="/menu" onClick={() => setIsOpen(false)}>
                <i className="fas fa-utensils" /> Menu
              </Link>
            </li>
            <li>
              <Link href="/cart" onClick={() => setIsOpen(false)}>
                <i className="fas fa-cart-shopping" /> Cart
              </Link>
            </li>
            <li>
              <Link href="/order-status" onClick={() => setIsOpen(false)}>
                <i className="fas fa-box" /> Order Status
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
