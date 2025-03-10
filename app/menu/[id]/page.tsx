"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

interface CartItem {
  id: number;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

const menuData = [
  {
    id: 1,
    name: "Croffles",
    description: "Flaky croissant waffles with a crispy edge.",
    options: [
      { size: "Mini", price: 55 },
      { size: "Regular", price: 90 },
    ],
    image: "/croffles.jpg",
  },
  {
    id: 2,
    name: "Churro Donuts",
    description: "Soft donuts coated in cinnamon sugar.",
    options: [
      { size: "3 pcs", price: 35 },
      { size: "5 pcs", price: 55 },
    ],
    image: "/churro-donut.jpg",
  },
  {
    id: 3,
    name: "Popping Boba",
    description: "Refreshing fruit-flavored boba pearls.",
    price: 40.0, // ✅ No options
    image: "/popping-boba.jpg",
  },
];

const MenuItemDetail: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  // ✅ `menuItem` should always be defined BEFORE `useState`
  const menuItem = menuData.find((item) => item.id === Number(id));

  // ✅ Avoid returning early! Define state first.
  const [quantity, setQuantity] = useState(1);
  const options = menuItem?.options ?? []; // Default to empty array
  const hasOptions = options.length > 0;
  const defaultOption = hasOptions ? options[0] : { size: "One Size", price: menuItem?.price || 0 };
  const [selectedOption, setSelectedOption] = useState(defaultOption);

  // ✅ Now safe to return (Hooks are already executed)
  if (!menuItem) return <p>Item not found</p>;

  return (
    <div className="menu-details-container">
      <button onClick={() => router.back()} className="back-button">Back</button>
      <div className="menu-details">
        <Image
          src={menuItem.image}
          alt={menuItem.name}
          className="menu-details-image"
          width={300}
          height={200}
          priority
        />
        <div className="menu-details-content">
          <h2 className="menu-details-title">{menuItem.name}</h2>
          <p className="menu-details-description">{menuItem.description}</p>

          {/* ✅ Show dropdown only if options exist */}
          {hasOptions ? (
            <select
              className="menu-details-select"
              value={selectedOption.size}
              onChange={(e) => {
                const selectedSize = options.find((opt) => opt.size === e.target.value);
                if (selectedSize) setSelectedOption(selectedSize);
              }}
            >
              {options.map((option, index) => (
                <option key={index} value={option.size}>
                  {option.size} - ₱{option.price.toFixed(2)}
                </option>
              ))}
            </select>
          ) : (
            <p className="menu-details-price">₱{menuItem.price?.toFixed(2)}</p>
          )}

          <div className="quantity-controls">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <button
            className="add-to-cart"
            onClick={() =>
              addToCart({
                id: menuItem.id,
                name: menuItem.name,
                size: selectedOption.size,
                price: selectedOption.price,
                quantity,
                image: menuItem.image,
              } as CartItem)
            }
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetail;
