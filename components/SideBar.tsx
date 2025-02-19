"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeFromCart } = useCart();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
              <Link href="/order-status" onClick={() => setIsOpen(false)}>📦 Order Status</Link>
            </li>
          </ul>
        </nav>

        {/* Cart Section */}
        <div className="cart-preview mt-4 p-3 bg-gray-100 rounded-lg shadow-md">
          <h3 className="text-lg font-bold">🛒 Your Cart</h3>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2 mb-2">
                  <div>
                    <h4 className="text-md font-semibold">{item.name}</h4>
                    <p className="text-gray-600">₱{item.price} x {item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm">Remove</button>
                </div>
              ))}
              <p className="text-lg font-bold mt-3">Total: ₱{totalPrice}</p>
              <Link href="/checkout">
                <button className="w-full bg-green-500 text-white py-2 mt-3 rounded">Proceed to Checkout</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
