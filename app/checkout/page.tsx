"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { addDoc, 
  collection, 
  serverTimestamp, 
  getDocs, 
  query, 
  orderBy, 
  limit  
} from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function CartPage() {
    const { cart, removeFromCart, clearCart } = useCart();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch

    // ✅ Calculate total price properly
    const totalPrice = cart.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);

    // ✅ Place Order with queueNumber assignment
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

        const { name, contact, deliveryType, location } = JSON.parse(storedCustomerInfo);

        try {
            // ✅ Get latest queue number
            const q = query(collection(db, "orders"), orderBy("queueNumber", "desc"), limit(1));
            const querySnapshot = await getDocs(q);
            const lastQueueNumber = querySnapshot.docs[0]?.data().queueNumber || 0;
            const nextQueueNumber = lastQueueNumber + 1;

            // ✅ Store order with correct size & queue number
            const docRef = await addDoc(collection(db, "orders"), {
                items: cart,
                customerInfo: { 
                    name,  
                    contact,
                    deliveryType,
                    deliveryLocation: deliveryType === "Delivery" ? location : "",
                },
                status: "Pending Payment",
                queueNumber: nextQueueNumber,
                timestamp: serverTimestamp(),
            });

            sessionStorage.setItem("orderId", docRef.id);
            toast.success(`Order Placed! Your Queue Number: ${nextQueueNumber}`);
            clearCart();
            router.push(`/checkout/confirm?orderId=${docRef.id}`);
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
                        <div key={`${item.id}-${item.size}`} className="cart-item">
                            <div>
                                <h2>{item.name} {item.size ? `(${item.size})` : ""}</h2> 
                                <p>₱{item.price.toFixed(2)} x {item.quantity}</p>
                            </div>
                            <button 
                                className="remove-btn"
                                onClick={() => removeFromCart(item.id, item.size)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    
                    {/* ✅ Show Total Price & Actions */}
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
