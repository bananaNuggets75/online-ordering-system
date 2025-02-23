'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';


const OrderForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    deliveryType: 'Pickup',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    // Generate order ID
    const orderId = Date.now().toString();
    const newOrder = { id: orderId, ...formData, status: 'Pending' };
  
    if (typeof window !== 'undefined') {
      // Save order to localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([...storedOrders, newOrder]));
  
      // Save user order ID for highlighting
      sessionStorage.setItem('userOrderId', orderId);
    }
  
    // Redirect to menu page
    router.push('/menu');
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
        <button type="submit" className="w-full p-3 bg-blue-500 text-white font-bold rounded hover:bg-blue-600">Submit</button>
      </form>
    </div>
  );
};

export default OrderForm;
