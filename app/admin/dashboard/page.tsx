"use client";

import { useEffect, useState, useCallback } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, updateDoc, doc, setDoc, deleteDoc, getDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import toast from "react-hot-toast";

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
  totalPrice?: number; 
  items: { 
    name: string; 
    quantity: number; 
    price: number; 
    size?: string; 
    flavor?: string;
    stock?: number;
    isOutOfStock?: boolean;
  }[];
}


const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

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
        const items = data.items || []; // 🔹 Get items array from Firestore
  
        // Compute total price by multiplying each item's price and quantity
        const totalPrice = items.reduce((sum: number, item: { price: number; quantity: number }) => {
          return sum + (item.price * item.quantity);
        }, 0);
  
        return {
          id: doc.id,
          customerName: data.customerInfo?.name || "N/A",
          contact: data.customerInfo?.contact || "N/A",
          deliveryType: data.customerInfo?.deliveryType || "N/A",
          deliveryLocation: data.customerInfo?.deliveryLocation || "N/A",
          status: data.status || "Pending",
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : "N/A",
          queueNumber: data.queueNumber || "N/A",
          totalPrice: totalPrice, 
          items: data.items || [],
        };
      });

      // 🔊 **Detect New Orders and Play Sound**
      if (updatedOrders.length > previousOrderCount) {
        console.log("New order detected! Playing notification sound...");
        playNotificationSound();
      }

      // Compute total revenue
      const computedTotalRevenue = updatedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    setOrders(updatedOrders);
    setTotalRevenue(computedTotalRevenue);
    setPreviousOrderCount(updatedOrders.length);
    setLoading(false);
    });

    return unsubscribe;
  }, [previousOrderCount]);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user, fetchOrders]);

  const playNotificationSound = () => {
    const audio = new Audio("/new-order.mp3");
    audio.play().catch((error) => console.error("Audio playback failed:", error));
  };

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

  const toggleOutOfStock = async (orderId: string, itemName: string, isOutOfStock: boolean) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnapshot = await getDoc(orderRef);
  
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.data();
        const updatedItems = orderData.items.map((item: { name: string; isOutOfStock?: boolean }) =>
          item.name === itemName ? { ...item, isOutOfStock } : item
        );
  
        await updateDoc(orderRef, { items: updatedItems });
        toast.success("Stock status updated!");
      } else {
        console.error("Order not found!");
      }
    } catch (error) {
      console.error("Error updating stock status:", error);
      toast.error("Failed to update stock status.");
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
      fetchOrders();
    } catch (error) {
      console.error("Error archiving orders: ", error);
    }
  };

  if (!authChecked) return <div className="p-6">Checking authentication...</div>;

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-title">Admin Dashboard</h1>
  
      {/* Total Revenue moved outside table */}
      <div className="total-revenue text-xl font-bold text-gray-800 mt-4">
        Total Revenue: <span className="text-green-600">₱{totalRevenue.toFixed(2)}</span>
      </div>
  
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Queue No.</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Delivery Type</th>
                <th>Delivery Location</th>
                <th>Items & Quantity</th>
                <th>Stock</th> 
                <th>Total Price</th> 
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
      <td>{order.customerName}</td>
      <td>{order.contact}</td>
      <td>{order.deliveryType}</td>
      <td>{order.deliveryLocation || "N/A"}</td>
      <td>
        {order.items.length > 0 ? (
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} {item.size ? `(${item.size})` : ""} 
                {item.flavor ? ` - Flavor: ${item.flavor}` : ""} 
                - {item.quantity}x
              </li>
            ))}
          </ul>
        ) : (
          "No items"
        )}
      </td>
      <td>
        {order.items.map((item, index) => (
          <div key={index}>
            <button
              className={`stock-toggle-btn ${item.isOutOfStock ? "out-of-stock" : ""}`}
              onClick={() => toggleOutOfStock(order.id, item.name, !item.isOutOfStock)}
            >
              {item.isOutOfStock ? "Out of Stock" : "In Stock"}
            </button>
          </div>
        ))}
      </td>
      <td>₱{(order.totalPrice ?? 0).toFixed(2)}</td>
      <td className={`status-${order.status.toLowerCase().replace(" ", "-")}`}>
        {order.status}
      </td>
      <td>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "N/A"}</td>
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