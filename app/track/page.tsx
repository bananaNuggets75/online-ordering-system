'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Order {
  id: string;
  customerName: string;
  contact: string;
  deliveryType: string;
  status: string;
  updatedAt?: string;
}

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    if (!orderId.trim()) {
      setError('Please enter a valid Order ID.');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        setOrderData(orderSnap.data() as Order);
      } else {
        setError('Order not found. Please check your Order ID.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to retrieve order. Try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Track Your Order</h1>
      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={fetchOrder}
        className="w-full bg-blue-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Track Order'}
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {orderData && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-lg font-semibold">Order Details</h2>
          <p><strong>Customer:</strong> {orderData.customerName}</p>
          <p><strong>Contact:</strong> {orderData.contact}</p>
          <p><strong>Delivery Type:</strong> {orderData.deliveryType}</p>
          <p><strong>Status:</strong> {orderData.status}</p>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
