"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Import Firebase Auth
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CheckOutPage() {  
  const { cart, removeFromCart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!user) {
      toast.error("Please log in to place an order.");
      router.push("/login");
      return;
    }

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid, // Store user's UID
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          size: item.size,
          flavor: item.flavor,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
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
  
      {cart.length > 0 && (
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
                onClick={() => removeFromCart(item.id, item.size, item.flavor ?? "No Flavor")}
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
