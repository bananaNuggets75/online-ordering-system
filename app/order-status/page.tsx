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
  queueNumber?: number | null; // New field for queue number
}

const MAX_QUEUE_SIZE = 20; // Maximum queue numbers

const OrderStatusPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userOrderId, setUserOrderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const storedUserOrderId = sessionStorage.getItem("userOrderId");
    setUserOrderId(storedUserOrderId);

    const q = query(collection(db, "orders"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      // Assign queue numbers automatically (1-20)
      const availableNumbers = Array.from({ length: MAX_QUEUE_SIZE }, (_, i) => i + 1);
      const activeOrders = ordersData.filter((order) => order.status !== "Completed");

      // Assign numbers to active orders
      activeOrders.forEach((order, index) => {
        if (index < MAX_QUEUE_SIZE) {
          order.queueNumber = availableNumbers[index]; // Assign queue number
        } else {
          order.queueNumber = null; // If more than 20 orders, no queue number
        }
      });

      setOrders(activeOrders);
    });

    return () => unsubscribe();
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="order-container">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Order Status</h1>

      <div className="order-list">
        {orders.length > 0 ? (
          orders
            .filter((order) => !userOrderId || order.id === userOrderId) // Show only user's order
            .map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id font-semibold">
                    Order #{order.queueNumber ? order.queueNumber : "Waiting..."} {/* Show queue number */}
                  </span>
                  <span className={`status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {order.status}
                  </span>
                </div>
                <p className="order-info">Name: {order.name || "N/A"}</p>
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
