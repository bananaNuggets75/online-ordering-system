"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

interface Order {
  id: string;
  name: string;
  contact: string;
  deliveryType: "Pickup" | "Delivery";
  status: "Pending" | "In-Process" | "Ready for Pickup" | "Out for Delivery" | "Completed";
}

const OrderStatusPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userOrderId, setUserOrderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Fix for hydration issue

  useEffect(() => {
    setIsClient(true); // Ensures this runs only on the client

    // Retrieve the user's order ID from sessionStorage
    const storedUserOrderId = sessionStorage.getItem("userOrderId");
    setUserOrderId(storedUserOrderId);

    // Firestore real-time listener for order updates
    const q = query(collection(db, "orders"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Prevent rendering on the server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className="order-container">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Order Status</h1>
  
      <div className="order-list">
        {orders.length > 0 ? (
          orders
            .filter((order) => !userOrderId || order.id === userOrderId) // Filter for user's order
            .map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id font-semibold">Order #{order.id}</span>
                  <span className={`status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {order.status}
                  </span>
                </div>
                <p className="order-info">Name: {order.name || "N/A"}</p>
                <p className="order-info">Contact: {order.contact || "N/A"}</p>
                <p className="order-info">Type: {order.deliveryType || "N/A"}</p>
              </div>
            ))
        ) : (
          <p className="text-center text-gray-600 text-lg">No orders found.</p>
        )}
      </div>
    </div>  
  );
};

export default OrderStatusPage;
