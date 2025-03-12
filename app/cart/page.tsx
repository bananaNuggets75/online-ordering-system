"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CheckOutPage() {  
  const { cart, removeFromCart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // Prevent hydration mismatch

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const storedCustomerInfo = sessionStorage.getItem("customerInfo");
    if (!storedCustomerInfo) {
      toast.error("Please fill out the order form first.");
      return;
    }

    const { name, contact, deliveryType, deliveryLocation } = JSON.parse(storedCustomerInfo);

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          size: item.size,
          flavor: item.flavor, // ✅ Includes flavor in the order
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerInfo: {
          name,  
          contact,
          deliveryType,
          deliveryLocation: deliveryType === "Delivery" ? deliveryLocation : "",
        },
        status: "Received",
        timestamp: serverTimestamp(),
      });

      sessionStorage.setItem("orderId", orderRef.id);
      clearCart();
      toast.success("Order Placed!");
      router.push("/checkout/confirm");
    } catch (error) {
      toast.error("Failed to place order");
      console.error("Order error:", error);
    }
  };

  return (
    <div className="cart-container">
      {cart.length === 0 ? (
        <h1 className="cart-title">Your cart is empty.</h1>
      ) : (
        <>
          <h1 className="cart-title">Almost There!</h1>
          <p className="cart-subtitle">Please double-check your items before placing your order.</p>
        </>
      )}
  
      {cart.length === 0 ? (
        <p className="text-gray-500">You have no items in your cart.</p>
      ) : (
        <div className="cart-list">
          {cart.map((item) => (
            <div key={`${item.id}-${item.size}-${item.flavor}`} className="cart-item">
              <div>
                <h2>
                  {item.name} {item.size ? `(${item.size})` : ""} 
                  {item.flavor ? ` - ${item.flavor}` : ""}
                </h2> 
                <p>₱{item.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <button 
                className="remove-btn"
                onClick={() => removeFromCart(item.id, item.size, item.flavor)} // ✅ Now removes specific flavor
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-4">
            <p className="text-xl font-bold">Total: ₱{totalPrice.toFixed(2)}</p>
            <div className="flex gap-2 mt-2">
              <button className="clear-cart-btn" onClick={clearCart}>
                Clear Cart
              </button>
              <button className="checkout-btn" onClick={placeOrder}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}  
