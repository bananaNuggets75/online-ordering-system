"use client";
import React from "react";
import { useCart } from "@/context/CartContext"; // Import the Cart context

// Sample menu data (Temporary; will be stored in Firebase later)
const menuData = [
  { id: 1, name: "Burger", description: "Delicious beef burger", price: 5.99 },
  { id: 2, name: "Pizza", description: "Cheese pizza with fresh toppings", price: 8.99 },
  { id: 3, name: "Fries", description: "Crispy golden fries", price: 2.99 },
  { id: 4, name: "Soda", description: "Refreshing soft drink", price: 1.99 },
];

const Menu: React.FC = () => {
  const { addToCart } = useCart(); // Get addToCart function

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <div className="grid grid-cols-1 gap-4">
        {menuData.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg shadow">
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p>{item.description}</p>
            <p className="font-bold">${item.price.toFixed(2)}</p>
            <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => addToCart({ ...item, quantity: 1 })} // Add quantity property
            >
              Add to Cart
              </button>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
