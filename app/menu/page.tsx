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
    description: "Flaky croissant waffles",
    image: "/croffles.jpg",
    isOutOfStock: false,
    options: [
      { size: "Mini", price: 59, isOutOfStock: false },
      { size: "Regular", price: 89, isOutOfStock: false }
    ],
    flavors: ["Biscoff Cream", "Cookies and Cream", "Matcha Cream Almond"]
  },
  {
    id: 2,
    name: "Churro Donuts",
    description: "Soft donuts coated in cinnamon sugar",
    image: "/churro-donut.jpg",
    isOutOfStock: false,
    options: [
      { size: "3 pcs", price: 39, isOutOfStock: false },
      { size: "5 pcs", price: 59, isOutOfStock: false }
    ],
    flavors: ["Nutella", "Caramel", "Biscoff"]
  },
  {
    id: 3,
    name: "Chewy Soda",
    description: "Refreshing fruit-flavored boba pearls.",
    image: "/popping-boba.jpg",
    price: 45,
    isOutOfStock: false,
    flavors: ["Strawberry", "Blueberry", "Lychee", "Green Apple"]
  }
];

const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<(typeof menuData)[0] | null>(null);
  const [selectedOption, setSelectedOption] = useState<{ size: string; price: number; isOutOfStock?: boolean } | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!selectedItem) return;

    if (selectedItem.isOutOfStock || (selectedOption && selectedOption.isOutOfStock)) {
      toast.error("This item is out of stock!");
      return;
    }

    addToCart({
      id: selectedItem.id,
      name: selectedItem.name,
      size: selectedOption?.size ?? "One Size",
      price: selectedOption?.price ?? selectedItem.price ?? 0,
      flavor: selectedFlavor ?? "No Flavor",
      quantity: 1,
      image: selectedItem.image
    });

    setSelectedItem(null);
    setSelectedOption(null);
    setSelectedFlavor(null);
  };

  return (
    <div className="menu-container">
      <h1 className="text-center text-3xl font-bold mb-4">Menu</h1>

      <div className="menu-list">
        {menuData.map((item) => (
          <div key={item.id} className="menu-item">
            <div
              onClick={() => {
                if (!item.isOutOfStock) {
                  router.push(`/menu/${item.id}`);
                }
              }}
              className={`cursor-pointer ${item.isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
            >
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

            <button
              className="add-to-cart"
              onClick={(e) => {
                e.stopPropagation();
                if (item.isOutOfStock) {
                  toast.error(`${item.name} is out of stock!`);
                  return;
                }
                setSelectedItem(item);
                setSelectedOption(null);
                setSelectedFlavor(null);
              }}
              disabled={item.isOutOfStock}
            >
              {item.isOutOfStock ? "Out of Stock" : "Add"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal for Selecting Options & Flavors */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-2">{selectedItem.description}</p>

            {/* Show options as selectable cards */}
            {selectedItem.options && selectedItem.options.length > 0 ? (
              <div className="options-grid">
                {selectedItem.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-card ${selectedOption?.size === option.size ? "selected" : ""} ${
                      option.isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => {
                      if (!option.isOutOfStock) setSelectedOption(option);
                    }}
                    disabled={option.isOutOfStock}
                  >
                    <Image src={selectedItem.image} alt={option.size} width={100} height={80} />
                    <p>{option.size}</p>
                    <p className="text-green-600 font-bold">₱{option.price}</p>
                    {option.isOutOfStock && <p className="text-red-500 font-bold">Out of Stock</p>}
                  </button>
                ))}
              </div>
            ) : (
              // No options (e.g., Chewy Soda)
              <button className="option-card" onClick={handleAddToCart} disabled={selectedItem.isOutOfStock}>
                <Image src={selectedItem.image} alt={selectedItem.name} width={100} height={100} />
                <p>₱{selectedItem.price}</p>
              </button>
            )}

            {/* Flavor Selection */}
            {selectedItem.flavors && selectedItem.flavors.length > 0 && (
              <div className="flavor-options mt-4">
                <h3 className="text-lg font-bold">Choose a Flavor:</h3>
                <select
                  className="border p-2 rounded w-full"
                  value={selectedFlavor || ""}
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                >
                  <option value="">Select a flavor</option>
                  {selectedItem.flavors.map((flavor, index) => (
                    <option key={index} value={flavor}>
                      {flavor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-buttons mt-4">
              {/* "Confirm" button to add item to cart */}
              <button
                onClick={handleAddToCart}
                className="confirm-btn"
                disabled={selectedItem.isOutOfStock || (selectedItem.options && !selectedOption)}
              >
                Confirm
              </button>

              {/* Cancel Button */}
              <button className="cancel-btn" onClick={() => setSelectedItem(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
