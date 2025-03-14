"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

const menuData = [
  {
    id: "1", // ✅ Changed to string for Firestore compatibility
    name: "Croffles",
    description: "Flaky croissant waffles with a crispy edge.",
    isAvailable: true,
    options: [
      { size: "Mini", price: 59 },
      { size: "Regular", price: 89 },
    ],
    flavors: ["Biscoff Cream", "Cookies and Cream", "Matcha Cream Almond"],
    image: "/croffles.jpg",
  },
  {
    id: "2",
    name: "Churro Donuts",
    description: "Soft donuts coated in cinnamon sugar.",
    isAvailable: true,
    options: [
      { size: "3 pcs", price: 39 },
      { size: "5 pcs", price: 59 },
    ],
    flavors: ["Nutella", "Caramel", "Biscoff"],
    image: "/churro-donut.jpg",
  },
  {
    id: "3",
    name: "Chewy Soda",
    description: "Refreshing fruit-flavored boba pearls.",
    isAvailable: true,
    price: 45,
    flavors: ["Strawberry", "Blueberry", "Lychee", "Green Apple"],
    image: "/popping-boba.jpg",
  },
];

const MenuItemDetail: React.FC = () => {
  const { id } = useParams(); // ✅ Ensure Firestore ID type consistency
  const router = useRouter();
  const { addToCart } = useCart();

  // ✅ Find the menu item by ID (converted to string)
  const menuItem = menuData.find((item) => item.id === id);

  // ✅ State Hooks
  const [quantity, setQuantity] = useState(1);
  const options = menuItem?.options ?? [];
  const hasOptions = options.length > 0;

  const defaultOption = hasOptions
    ? options[0]
    : { size: "One Size", price: menuItem?.price || 0 };

  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const [selectedFlavor, setSelectedFlavor] = useState(
    menuItem?.flavors?.[0] ?? "No Flavor"
  );

  if (!menuItem) return <p>Item not found</p>;

  // ✅ Handle adding to cart
  const handleAddToCart = () => {
    addToCart({
      id: menuItem.id,
      name: menuItem.name,
      size: selectedOption.size,
      price: selectedOption.price,
      quantity,
      image: menuItem.image,
      flavor: selectedFlavor,
    });

    router.back(); // ✅ Redirect after adding to cart
  };

  return (
    <div className="menu-details-container">
      {/* ✅ Back Button */}
      <button onClick={() => router.back()} className="back-button">
        Back
      </button>

      <div className="menu-details">
        {/* ✅ Image */}
        <Image
          src={menuItem.image}
          alt={menuItem.name}
          className="menu-details-image"
          width={300}
          height={200}
          priority
        />

        <div className="menu-details-content">
          {/* ✅ Title & Description */}
          <h2 className="menu-details-title">{menuItem.name}</h2>
          <p className="menu-details-description">{menuItem.description}</p>

          {/* ✅ Size Selection */}
          {hasOptions && (
            <div className="size-dropdown mt-4">
              <h3 className="text-lg font-bold">Choose a Size:</h3>
              <select
                className="border p-2 rounded w-full"
                value={selectedOption.size}
                onChange={(e) => {
                  const selectedSize = options.find(
                    (opt) => opt.size === e.target.value
                  );
                  if (selectedSize) setSelectedOption(selectedSize);
                }}
              >
                {options.map((option, index) => (
                  <option key={index} value={option.size}>
                    {option.size} - ₱{option.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ✅ Flavor Selection */}
          {menuItem.flavors && (
            <div className="flavor-dropdown mt-4">
              <h3 className="text-lg font-bold">Choose a Flavor:</h3>
              <select
                className="border p-2 rounded w-full"
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
              >
                {menuItem.flavors.map((flavor, index) => (
                  <option key={index} value={flavor}>
                    {flavor}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ✅ Quantity Control */}
          <div className="quantity-controls mt-4">
            <button
              className="quantity-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <span className="px-4">{quantity}</span>
            <button
              className="quantity-btn"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>

          {/* ✅ Add to Cart Button */}
          <button
            className="add-to-cart-btn mt-4"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetail;
