"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

const menuData = [
  { "id": 1, "name": "Croffles", "description": "Flaky croissant waffles with a crispy edge. \n Mini - ₱55 | Regular - ₱90", "price": 55.00, "image": "/croffles.jpg" },
  { "id": 2, "name": "Churro Donuts", "description": "Soft donuts coated in cinnamon sugar. \n 3 pcs - ₱35 | 5 pcs - ₱55", "price": 35.00, "image": "/churro-donut.jpg" },
  { "id": 3, "name": "Popping Boba", "description": "Refreshing fruit-flavored boba pearls.", "price": 40.00, "image": "/popping-boba.jpg" },
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
            <Image src={item.image} alt={item.name} className="menu-item-image" width={300} height={200} priority />
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