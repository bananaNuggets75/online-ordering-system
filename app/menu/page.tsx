"use client";
import React, { useState, useEffect } from "react";
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

type Flavor = {
  name: string;
  isOutOfStock: boolean;
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  isOutOfStock?: boolean;
  stock?: number;
  image: string;
  isAvailable: boolean;
  options?: Option[];
  flavors?: Flavor[];
}


// --- Component ---
const MenuPage: React.FC = () => {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");

  // Open the customization modal for an item (guards out-of-stock).
  const openItem = (item: MenuItem) => {
    if (item.isOutOfStock) {
      toast.error(`${item.name} is out of stock!`);
      return;
    }
    setSelectedItem(item);
    setSelectedOption(null);
    setSelectedFlavor("");
  };

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedOption(null);
    setSelectedFlavor("");
  };
  

  // Real-time fetch from Firebase with error handling
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "menu"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          const stock = typeof data.stock === "number" ? data.stock : undefined;
          const unavailable = data.isAvailable === false;
          const soldOut = typeof stock === "number" && stock <= 0;
          return {
            id: doc.id,
            name: data.name || "Unnamed Item",
            description: data.description || "No description available",
            price: data.price ?? 0,
            stock,
            isOutOfStock: unavailable || soldOut,
            image: data.image || "/placeholder.png",
            options: data.options || [],
            flavors: data.flavors || [],
          } as MenuItem;
        });
        setMenuItems(items);
      },
      (error) => {
        console.error("Error fetching menu:", error);
        toast.error("Failed to load menu items!");
      }
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Handle Add to Cart with required field checks
  const handleAddToCart = () => {
    if (!selectedItem) return;

    const isItemOutOfStock = selectedItem.isOutOfStock || (selectedOption && selectedOption.isOutOfStock);
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
    setSelectedItem(null);
    setSelectedOption(null);
    setSelectedFlavor("");
  };

  const priceLabel = selectedItem
    ? selectedOption
      ? `₱${selectedOption.price.toFixed(2)}`
      : selectedItem.options && selectedItem.options.length > 0
      ? `from ₱${Math.min(...selectedItem.options.map((o) => o.price)).toFixed(2)}`
      : `₱${(selectedItem.price ?? 0).toFixed(2)}`
    : "";

  return (
    <div className="menu-container">
      <h1>Menu</h1>

      <div className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className={`menu-item ${item.isOutOfStock ? "out-of-stock" : ""}`}>
            <div
              onClick={() => openItem(item)}
              className={`menu-item-clickable ${item.isOutOfStock ? "pointer-events-none" : ""}`}
            >
              <Image
                src={item.image || "/placeholder.png"}
                alt={item.name}
                className="menu-item-image"
                width={300}
                height={200}
              />
              {item.isOutOfStock && <div className="out-of-stock-badge">Out of Stock</div>}
              <div className="menu-item-content">
                <h3>{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
                {!item.isOutOfStock && typeof item.stock === "number" && item.stock <= 5 && (
                  <p className="low-stock-hint">Only {item.stock} left!</p>
                )}
              </div>
            </div>

            <button
              className="add-to-cart"
              onClick={() => openItem(item)}
              disabled={item.isOutOfStock}
            >
              {item.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hero">
              <Image
                src={selectedItem.image || "/placeholder.png"}
                alt={selectedItem.name}
                fill
                sizes="440px"
                className="modal-hero-img"
              />
            </div>

            <h2 className="modal-title">{selectedItem.name}</h2>
            <p className="modal-desc">{selectedItem.description}</p>
            <p className="modal-price">{priceLabel}</p>

            {selectedItem.options && selectedItem.options.length > 0 && (
              <div className="options-grid">
                {selectedItem.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-card ${selectedOption?.size === option.size ? "selected" : ""}`}
                    onClick={() => {
                      if (!option.isOutOfStock) setSelectedOption(option);
                    }}
                    disabled={option.isOutOfStock}
                  >
                    <span className="option-size">{option.size}</span>
                    <span className="option-price">₱{option.price.toFixed(2)}</span>
                    {option.isOutOfStock && <span className="option-oos">Out of stock</span>}
                  </button>
                ))}
              </div>
            )}

            {selectedItem.flavors && selectedItem.flavors.length > 0 && (
              <div className="flavor-options">
                <h3>Choose a Flavor</h3>
                <select
                  className="flavor-dropdown"
                  value={selectedFlavor || ""}
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                >
                  <option value="" disabled>
                    Select a flavor
                  </option>
                  {selectedItem.flavors.map((flavor, index) => (
                    <option key={index} value={flavor.name} disabled={flavor.isOutOfStock}>
                      {flavor.name} {flavor.isOutOfStock ? "(Out of Stock)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="confirm-btn"
                disabled={
                  selectedItem.isOutOfStock ||
                  (selectedItem.options && selectedItem.options.length > 0 && !selectedOption)
                }
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
