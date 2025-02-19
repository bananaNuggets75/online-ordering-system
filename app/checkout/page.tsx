"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    setIsProcessing(true);

    setTimeout(() => {
      clearCart();
      toast.success("Order placed successfully!", {
        position: "top-center",
        duration: 3000,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
          padding: "10px",
        },
      });
      router.push("/");
    }, 2000); 
  };

  return (
    <div className="checkout-container max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>₱{item.price * item.quantity}</span>
            </div>
          ))}
          <p className="text-lg font-bold mt-4">Total: ₱{totalPrice}</p>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`w-full py-2 mt-4 rounded ${
              isProcessing ? "bg-gray-400" : "bg-blue-500 text-white"
            }`}
          >
            {isProcessing ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      )}
    </div>
  );
}
