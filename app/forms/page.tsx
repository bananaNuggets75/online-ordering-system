'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const OrderForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    deliveryType: 'Pickup',
    location: '' // Added location field
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Generate unique order ID
    const orderId = Date.now().toString();
  
    // New order object
    const newOrder = { 
      id: orderId, 
      customerName: formData.name,
      contact: formData.contact, 
      deliveryType: formData.deliveryType, 
      location: formData.deliveryType === 'Delivery' ? formData.location : '', // Store only if Delivery
      status: 'Pending', 
      updatedAt: serverTimestamp()
    };
  
    try {
      // Save order to Firestore
      await setDoc(doc(db, "orders", orderId), newOrder);
  
      // Save order to localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([...storedOrders, newOrder]));
  
      // Store order ID in sessionStorage for tracking
      sessionStorage.setItem('userOrderId', orderId);
  
      // Redirect to menu page
      router.push('/menu');
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Place Your Order</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-semibold">Contact:</label>
          <input type="text" name="contact" value={formData.contact} onChange={handleChange} required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-semibold">Delivery Type:</label>
          <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="Pickup">Pickup</option>
            <option value="Delivery">Delivery (Only within CPU)</option>
          </select>
        </div>
        
        {/* Show location field only if Delivery is selected */}
        {formData.deliveryType === 'Delivery' && (
          <div>
            <label className="block font-semibold">Delivery Location:</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              required={formData.deliveryType === 'Delivery'} 
              className="w-full p-2 border rounded" 
              placeholder="Enter delivery location" 
            />
          </div>
        )}

        <button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">Submit</button>
      </form>
    </div>
  );
};

export default OrderForm;
