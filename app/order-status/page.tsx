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
  const [userName, setUserName] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load stored user name and orders
  useEffect(() => {
    setIsClient(true);

    const storedUserName = sessionStorage.getItem("userName");
    setUserName(storedUserName);

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

      // Assign queue numbers to active orders only
      const availableNumbers = Array.from({ length: MAX_QUEUE_SIZE }, (_, i) => i + 1);
      const updatedOrders = ordersData.map((order) => ({
        ...order,
        queueNumber: order.status !== "Completed" ? availableNumbers.shift() ?? null : null,
      }));

      setOrders(updatedOrders);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedOrders)); // Save to local storage
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
            .filter((order) => !userName || order.name === userName) // Show all orders under the same name
            .map((order) => (
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
