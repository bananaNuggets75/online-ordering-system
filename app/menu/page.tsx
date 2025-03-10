"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast"; 
import Image from "next/image";

const menuData = [
  {
    id: 1,
    name: "Croffles",
    description: "Flaky croissant waffles with a crispy edge.",
    image: "/croffles.jpg",
    options: [
      { size: "Mini", price: 55 },
      { size: "Regular", price: 90 },
    ],
  },
  {
    id: 2,
    name: "Churro Donuts",
    description: "Soft donuts coated in cinnamon sugar.",
    image: "/churro-donut.jpg",
    options: [
      { size: "3 pcs", price: 35 },
      { size: "5 pcs", price: 55 },
    ],
  },
  {
    id: 3,
    name: "Popping Boba",
    description: "Refreshing fruit-flavored boba pearls.",
    price: 40,
    image: "/popping-boba.jpg",
  },
];

const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<(typeof menuData)[0] | null>(null);
  const [selectedOption, setSelectedOption] = useState<{ size: string; price: number } | null>(null);

  const handleAddToCart = () => {
    if (!selectedItem) return;
    if (selectedItem.options && !selectedOption) {
      toast.error("Please select an option before adding to cart.");
      return;
    }
  
    addToCart({
      id: selectedItem.id,
      name: selectedItem.name,
      size: selectedOption?.size ?? "One Size",
      price: selectedOption?.price ?? selectedItem.price ?? 0,
      quantity: 1,
      image: selectedItem.image,
    });
  
    setSelectedItem(null);
    setSelectedOption(null);
  };
  

  return (
    <div className="menu-container">
      <h1 className="text-center text-3xl font-bold mb-4">Menu</h1>

      <div className="menu-list">
        {menuData.map((item) => (
          <div key={item.id} className="menu-item">
            {/* ✅ Clicking anywhere navigates to menu details */}
            <div onClick={() => router.push(`/menu/${item.id}`)} className="cursor-pointer">
              <Image
                src={item.image}
                alt={item.name}
                className="menu-item-image"
                width={300}
                height={200}
                priority
              />
              <div className="menu-item-content">
                <h3>{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
              </div>
            </div>

            {/* ✅ "Add" button opens the modal */}
            <button
              className="add-to-cart"
              onClick={(e) => {
                e.stopPropagation(); // Prevents navigation when clicking "Add"
                setSelectedItem(item);
                setSelectedOption(null); // Reset selected option when opening modal
              }}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* ✅ Modal for Selecting Options */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-2">{selectedItem.description}</p>

            {/* ✅ Show options as selectable cards */}
            {selectedItem.options && selectedItem.options.length > 0 ? (
              <div className="options-grid">
                {selectedItem.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-card ${selectedOption?.size === option.size ? "selected" : ""}`}
                    onClick={() => setSelectedOption(option)}
                  >                
                    <Image src={selectedItem.image} alt={option.size} width={100} height={80} />
                    <p>{option.size}</p>
                    <p className="text-green-600 font-bold">₱{option.price}</p>
                  </button>
                ))}
              </div>
            ) : (
              // ✅ No options (e.g., Popping Boba)
              <button
                className="option-card"
                onClick={handleAddToCart}
              >
                <Image src={selectedItem.image} alt={selectedItem.name} width={100} height={100} />
                <p>₱{selectedItem.price}</p>
              </button>
            )}

            {/* ✅ "Confirm" button to add item to cart */}
            <button 
              onClick={handleAddToCart} 
              className="confirm-btn"
              disabled={selectedItem.options && !selectedOption} // ✅ Disable if no option selected
            >
              Confirm
            </button>

            {/* ✅ Cancel Button */}
            <button className="cancel-btn" onClick={() => setSelectedItem(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
