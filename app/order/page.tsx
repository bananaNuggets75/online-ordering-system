'use client';

import React, { useState } from 'react';

const OrderForm: React.FC = () => {
  // Local state for form inputs
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    deliveryType: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.contact || !formData.deliveryType) {
      alert('Please fill in all required fields.');
      return;
    }

    // Store form data (can be passed to menu page)
    sessionStorage.setItem('orderForm', JSON.stringify(formData));
    setSuccessMessage('Information submitted successfully!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Order Information</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Name */}
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Contact */}
        <div>
          <label>Contact Number:</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>

        {/* Delivery Type */}
        <div>
          <label>Delivery Type:</label>
          <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} required>
            <option value="" disabled>
              -- Select Delivery Option --
            </option>
            <option value="pickup">Pick Up</option>
            <option value="cpu">CPU Delivery (Available only in CPU)</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit">Submit</button>
      </form>

      {/* Success Message & Navigate to Menu */}
      {successMessage && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ color: 'green' }}>{successMessage}</p>
          <a href="/menu">
            <button>Go to Menu</button>
          </a>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
