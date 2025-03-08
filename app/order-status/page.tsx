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
  queueNumber?: number | null;
}

const MAX_QUEUE_SIZE = 20;
const LOCAL_STORAGE_KEY = "userOrders";

const OrderStatusPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedOrders = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      const activeOrders = ordersData.filter((order) => order.status !== "Completed");
      const availableNumbers = Array.from({ length: MAX_QUEUE_SIZE }, (_, i) => i + 1);

      const updatedOrders = activeOrders.map((order) => ({
        ...order,
        queueNumber: availableNumbers.shift() ?? null,
      }));

      // Compare previous orders with new ones to detect status change
      orders.forEach((prevOrder) => {
        const newOrder = updatedOrders.find((o) => o.id === prevOrder.id);
        if (newOrder && newOrder.status !== prevOrder.status) {
          if (["Ready for Pickup", "Out for Delivery"].includes(newOrder.status)) {
            playNotificationSound();
          }
        }
      });

      setOrders(updatedOrders);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedOrders));
    });

    return () => unsubscribe();
  }, [orders]);

  // 🔊 Function to play notification sound
  const playNotificationSound = () => {
    const audio = new Audio("public/new-order.mp3"); // Place this file in `public/`
    audio.play().catch((error) => console.error("Audio playback failed:", error));
  };

  if (!isClient) return null;

  return (
    <div className="order-container">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Order Status</h1>

      <div className="order-list">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id font-semibold">
                  Order #{order.queueNumber ? order.queueNumber : "Waiting..."}
                </span>
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
