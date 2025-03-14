"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";

// --- Interfaces ---
interface Option {
  size: string;
  price: number;
  isOutOfStock?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  isOutOfStock?: boolean;
  image: string;
  options?: Option[];
  flavors?: string[];
}

// --- Component ---
const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");

  // ✅ Real-time fetch from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          isOutOfStock: data.isAvailable === false, // Handle availability
          image: data.image,
          options: data.options || [],
          flavors: data.flavors || [],
        } as MenuItem;
      });
      setMenuItems(items);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // ✅ Handle Add to Cart
  const handleAddToCart = () => {
    if (!selectedItem) return;

    const isItemOutOfStock =
      selectedItem.isOutOfStock ||
      (selectedOption && selectedOption.isOutOfStock);

    if (isItemOutOfStock) {
      toast.error("This item is out of stock!");
      return;
    }

    addToCart({
      id: selectedItem.id,
      name: selectedItem.name,
      size: selectedOption?.size ?? "One Size",
      price: selectedOption?.price ?? selectedItem.price ?? 0,
      flavor: selectedFlavor || "No Flavor",
      quantity: 1,
      image: selectedItem.image,
    });

    toast.success(`${selectedItem.name} added to cart!`);
    // Reset selections
    setSelectedItem(null);
    setSelectedOption(null);
    setSelectedFlavor("");
  };

  return (
    <div className="menu-container">
      <h1 className="text-center text-3xl font-bold mb-4">Menu</h1>

      <div className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className={`menu-item ${item.isOutOfStock ? "out-of-stock" : ""}`}>
            {/* ✅ Disable click when out of stock */}
            <div
              onClick={() => {
                if (!item.isOutOfStock) {
                  router.push(`/menu/${item.id}`);
                }
              }}
              className={`cursor-pointer ${
                item.isOutOfStock ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {/* ✅ Fix Image */}
              <Image
                src={item.image || "/placeholder.png"}
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

              {/* ✅ Out of Stock Badge */}
              {item.isOutOfStock && (
                <div className="out-of-stock-badge">
                  Out of Stock
                </div>
              )}
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
                setSelectedFlavor("");
              }}
              disabled={item.isOutOfStock}
            >
              {item.isOutOfStock ? "Out of Stock" : "Add"}
            </button>
          </div>
        ))}
      </div>

      {/* ✅ Modal for Selecting Options & Flavors */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-2">{selectedItem.description}</p>

            {/* ✅ Fix Image in Modal */}
            <Image
              src={selectedItem.image || "/placeholder.png"}
              alt={selectedItem.name}
              width={100}
              height={100}
            />

            {/* ✅ Options */}
            {selectedItem.options && selectedItem.options.length > 0 ? (
              <div className="options-grid">
                {selectedItem.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-card ${
                      selectedOption?.size === option.size ? "selected" : ""
                    } ${
                      option.isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => {
                      if (!option.isOutOfStock) setSelectedOption(option);
                    }}
                    disabled={option.isOutOfStock}
                  >
                    <p>{option.size}</p>
                    <p className="text-green-600 font-bold">₱{option.price}</p>
                    {option.isOutOfStock && <p className="text-red-500">Out of Stock</p>}
                  </button>
                ))}
              </div>
            ) : (
              <button
                className="option-card"
                onClick={handleAddToCart}
                disabled={selectedItem.isOutOfStock}
              >
                ₱{selectedItem.price}
              </button>
            )}

            {/* ✅ Flavors */}
            {selectedItem.flavors && selectedItem.flavors.length > 0 && (
              <div className="flavor-options">
                <h3 className="text-lg font-bold">Choose a Flavor:</h3>
                <select
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

            {/* ✅ Modal Buttons */}
            <div className="modal-buttons">
              <button onClick={handleAddToCart} className="confirm-btn">
                Confirm
              </button>
              <button
                className="cancel-btn"
                onClick={() => setSelectedItem(null)}
              >
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
