'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const OrderForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    deliveryType: 'Pickup',
    location: ''
  });

  // Ensure localStorage is only accessed after component mounts
  useEffect(() => {
    const storedOrder = sessionStorage.getItem('userOrderId');
    if (storedOrder) {
      console.log("Restoring user order ID:", storedOrder);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const orderId = Date.now().toString();
  
    const newOrder = { 
      id: orderId, 
      customerName: formData.name,
      contact: formData.contact, 
      deliveryType: formData.deliveryType, 
      deliveryLocation: formData.deliveryType === 'Delivery' ? formData.location : '', 
      status: 'Pending', 
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "orders", orderId), newOrder);

      if (typeof window !== 'undefined') {
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        localStorage.setItem('orders', JSON.stringify([...storedOrders, newOrder]));

        sessionStorage.setItem('userOrderId', orderId);
      }

      router.push('/menu');
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="order-form-container">
      <h1 className="order-title">Place Your Order</h1>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label className="form-label">Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Contact:</label>
          <input type="text" name="contact" value={formData.contact} onChange={handleChange} required className="form-input" />
        </div>
  
        <div className="form-group">
          <label className="form-label">Delivery Type:</label>
          <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="form-select">
            <option value="Pickup">Pickup</option>
            <option value="Delivery">Delivery (Only within CPU)</option>
          </select>
        </div>
  
        {formData.deliveryType === 'Delivery' && (
          <div className="form-group">
            <label className="form-label">Delivery Location:</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              required 
              className="form-input" 
              placeholder="Enter delivery location" 
            />
          </div>
        )}
  
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
}

export default OrderForm;
