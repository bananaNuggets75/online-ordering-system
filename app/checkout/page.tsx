"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { FieldValue } from "firebase/firestore";

interface CustomerInfo {
    name: string;
    contact: string;
  }
  
  interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }
  
  interface Order {
    items: OrderItem[];
    customerInfo: CustomerInfo;
    status: string;
    timestamp: FieldValue;
  }

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevents hydration mismatch

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Create an order object with types
    const newOrder: Order = {
      items: cart,
      customerInfo: {
        name: "John Doe", // Replace with actual user info
        contact: "john.doe@example.com",
      },
      status: "Received",
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "orders"), newOrder);
      toast.success("Order Placed!");
      clearCart();
    } catch (error) {
      toast.error("Failed to place order");
      console.error("Order error:", error);
    }
  };

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <h2>{item.name}</h2>
                <p>₱{item.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <button 
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
          
          {/* Total Price & Actions */}
          <div className="mt-4">
            <p className="text-xl font-bold">Total: ₱{totalPrice.toFixed(2)}</p>
            <div className="flex gap-2 mt-2">
              <button 
                className="clear-cart-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button 
                className="checkout-btn"
                onClick={placeOrder}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}