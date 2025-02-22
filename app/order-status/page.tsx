'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  name: string;
  contact: string;
  deliveryType: 'Pickup' | 'Delivery';
  status: 'Pending' | 'In-Process' | 'Ready for Pickup' | 'Out for Delivery';
}

const OrderStatusPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userOrderId, setUserOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch orders from localStorage (or ideally, from a database via an API call)
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);
    
    // Retrieve the user's order ID from sessionStorage
    const storedUserOrderId = sessionStorage.getItem('userOrderId');
    setUserOrderId(storedUserOrderId);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order Status</h1>
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className={`p-4 border rounded-lg shadow-sm ${
                order.id === userOrderId ? 'bg-yellow-100 border-yellow-500' : 'bg-white'
              }`}
            >
              <p className="font-bold">Order #{order.id}</p>
              <p>Name: {order.name}</p>
              <p>Contact: {order.contact}</p>
              <p>Type: {order.deliveryType}</p>
              <p className="font-semibold">Status: {order.status}</p>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;
