"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const menuData = [
  { id: 1, name: "Burger", description: "Delicious beef burger", price: 120.99, image: "/burger.jpg" },
  { id: 2, name: "Pizza", description: "Cheese pizza with fresh toppings", price: 350.00, image: "/pizza.jpg" },
  { id: 3, name: "Fries", description: "Crispy golden fries", price: 79.99, image: "/fries.jpg" },
  { id: 4, name: "Soda", description: "Refreshing soft drink", price: 25.00, image: "/coke.jpg" },
];

const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(""); // For search

  const filteredMenuData = menuData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="menu-container">
      <div className="search-bar"> {/* Search bar */}
        <input
          type="text"
          placeholder="Find nearby food"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="menu-list">
        {filteredMenuData.map((item) => (
          <div
            key={item.id}
            className="menu-item"
            onClick={() => router.push(`/menu/${item.id}`)}
          >
            <img src={item.image} alt={item.name} className="menu-item-image" />
            <div className="menu-item-content">
              <div className="menu-item-title-price"> {/* Title and price side by side */}
                <h3>{item.name}</h3>
                <p className="menu-price">₱{item.price.toFixed(2)}</p>
              </div>
              <p className="menu-item-description">{item.description}</p>
              <div className="menu-item-actions"> {/* Add to cart and rating */}
                <button
                  className="add-to-cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ ...item, quantity: 1 });
                  }}
                >
                  Add
                </button>
                {/* Add rating display here (e.g., using a star rating component) */}
                <div className="rating"> {/* Placeholder for rating */}
                  ★★★★☆
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;