"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { db, auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CheckOutPage() {  
  const { cart, removeFromCart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [deliveryType, setDeliveryType] = useState("Pickup");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  if (!mounted) return null;

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
    if (!name || !contact || (deliveryType === "Delivery" && !deliveryLocation)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customerInfo: {
          name,
          contact,
          deliveryType,
          deliveryLocation: deliveryType === "Delivery" ? deliveryLocation : "",
        },
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
          <p className="cart-subtitle">Please enter your details and review your items.</p>
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

          {/* Delivery Details Form */}
          <div className="mt-4">
            <h2 className="text-xl font-bold">Delivery Details</h2>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="input-field" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input 
                type="text" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)}
                className="input-field" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Delivery Type</label>
              <select 
                value={deliveryType} 
                onChange={(e) => setDeliveryType(e.target.value)}
                className="input-field"
              >
                <option value="Pickup">Pickup</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>
            {deliveryType === "Delivery" && (
              <div className="form-group">
                <label>Delivery Location</label>
                <input 
                  type="text" 
                  value={deliveryLocation} 
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="input-field" 
                  required 
                />
              </div>
            )}
          </div>

          {/* Order Summary & Buttons */}
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
