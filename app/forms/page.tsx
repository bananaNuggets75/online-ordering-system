'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FormsPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    deliveryType: 'Pickup',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save form data in sessionStorage
    sessionStorage.setItem('userName', formData.name);
    sessionStorage.setItem('userContact', formData.contact);
    sessionStorage.setItem('deliveryType', formData.deliveryType);

    // Navigate to menu page
    router.push('/menu');
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Contact:</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold">Delivery Type:</label>
          <select
            name="deliveryType"
            value={formData.deliveryType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Pickup">Pickup</option>
            <option value="Delivery">Delivery</option>
          </select>
          {formData.deliveryType === 'Delivery' && (
            <p className="text-sm text-red-500 mt-1">Delivery is only available within CPU.</p>
          )}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Proceed to Menu
        </button>
      </form>
    </div>
  );
};

export default FormsPage;