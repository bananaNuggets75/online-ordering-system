"use client";

import { useEffect, useState, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, updateDoc, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;
const ORDER_LIMIT = 20;

interface Order {
  id: string;
  customerName: string;
  contact: string;
  deliveryType: string;
  deliveryLocation?: string;
  status: string;
  updatedAt?: string;
  queueNumber?: number;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.uid !== ADMIN_UID) {
        router.push("/admin/login");
      } else {
        setUser(currentUser);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [router]);

const fetchOrders = useCallback(() => {
  const ordersRef = collection(db, "orders");
  const ordersQuery = query(ordersRef, orderBy("queueNumber", "asc"), limit(ORDER_LIMIT));

  const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
    const updatedOrders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        customerName: data.customerInfo?.name || "N/A",
        contact: data.customerInfo?.contact || "N/A",
        deliveryType: data.customerInfo?.deliveryType || "N/A",
        deliveryLocation: data.customerInfo?.deliveryLocation || "N/A",
        status: data.status || "Pending",
        updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : "N/A",
        queueNumber: data.queueNumber || "N/A",
      };
    });

    setOrders(updatedOrders);
    setLoading(false);
  });

  return unsubscribe;
}, []); // ✅ Empty dependency array ensures it doesn’t recreate every render

useEffect(() => {
  if (!user) return;
  fetchOrders();
}, [user, fetchOrders]);  // ✅ No more warnings


  

  /*const playSound = (filePath: string) => {
    const audio = new Audio(filePath);
    audio.play().catch((err) => console.error("🔇 Audio play failed:", err));
  };*/

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        status: newStatus, 
        updatedAt: serverTimestamp(),
      });

      if (newStatus === "Order Received") {
        setTimeout(() => {
          setSelectedOrders([orderId]);
          archiveSelectedOrders();
        }, 60000);
      }      
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  const handleCheckboxChange = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const archiveSelectedOrders = async () => {
    try {
      for (const orderId of selectedOrders) {
        const order = orders.find((o) => o.id === orderId);
        if (!order) continue;

        const archiveRef = doc(db, "archived_orders", orderId);
        await setDoc(archiveRef, {
          ...order,
          archivedAt: serverTimestamp(),
        });

        const orderRef = doc(db, "orders", orderId);
        await deleteDoc(orderRef);
      }

      setSelectedOrders([]);
      fetchOrders(); // Refresh orders to fill empty slots
    } catch (error) {
      console.error("Error archiving orders: ", error);
    }
  };

  if (!authChecked) return <div className="p-6">Checking authentication...</div>;

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Queue No.</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Delivery Type</th>
                <th>Delivery Location</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleCheckboxChange(order.id)}
                    />
                  </td>
                  <td>{order.queueNumber}</td>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.contact}</td>
                  <td>{order.deliveryType}</td>
                  <td>{order.deliveryLocation || "N/A"}</td>
                  <td className={`status-${order.status.toLowerCase().replace(" ", "-")}`}>
                    {order.status}
                  </td>
                  <td>{new Date(order.updatedAt || "").toLocaleString()}</td>
                  <td>
                    <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="To be Paid">To be Paid</option> 
                      <option value="In-Process">In-Process</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Paid (Completed)">Paid (Completed)</option>
                      <option value="Order Received">Order Received</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedOrders.length > 0 && (
            <div className="flex justify-center mt-6 p-6">
              <button onClick={archiveSelectedOrders} className="archive-btn">
                Move to Archive ({selectedOrders.length} selected)
              </button>
            </div>
          )}
        </div>
      )}
      <div className="footer">
        &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
      </div>
    </div>
  );  
};

export default AdminDashboard;
