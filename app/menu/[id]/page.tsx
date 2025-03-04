"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

const menuData = [
  { id: 1, name: "Burger", description: "Delicious beef burger", price: 5.99, image: "/burger.jpg" },
  { id: 2, name: "Pizza", description: "Cheese pizza with fresh toppings", price: 8.99, image: "/pizza.jpg" },
  { id: 3, name: "Fries", description: "Crispy golden fries", price: 2.99, image: "/fries.jpg" },
  { id: 4, name: "Soda", description: "Refreshing soft drink", price: 1.99, image: "/soda.jpg" },
];

const MenuItemDetail: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const menuItem = menuData.find((item) => item.id === Number(id));
    const [quantity, setQuantity] = useState(1);
  
    if (!menuItem) return <p>Item not found</p>;
  
    return (
      <div className="menu-details-container"> {/* Main container for details */}
        <button onClick={() => router.back()} className="back-button">Back</button>
        <div className="menu-details">
          <Image src={menuItem.image} alt={menuItem.name} className="menu-details-image" width={300} height={200} priority />
          <div className="menu-details-content">
            <h2 className="menu-details-title">{menuItem.name}</h2>
            <p className="menu-details-description">{menuItem.description}</p>
            <p className="menu-details-price">₱{menuItem.price.toFixed(2)}</p>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button
              className="add-to-cart"
              onClick={() => addToCart({ ...menuItem, quantity })}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default MenuItemDetail;
