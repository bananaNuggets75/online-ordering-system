"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";
import { ShoppingCart, Star, Clock, Flame } from "lucide-react";

// Interfaces
interface Option {
  size: string;
  price: number;
  isOutOfStock?: boolean;
}

interface Flavor {
  name: string;
  isOutOfStock: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  isOutOfStock?: boolean;
  image: string;
  isAvailable: boolean;
  options?: Option[];
  flavors?: Flavor[];
  category?: string;
  isPopular?: boolean;
  prepTime?: string;
}

const MenuPage: React.FC = () => {
  const { addToCart, cart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Real-time fetch from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "menu"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            name: data.name || "Unnamed Item",
            description: data.description || "Delicious food item",
            price: data.price ?? 0,
            isOutOfStock: data.isAvailable !== undefined ? !data.isAvailable : false,
            image: data.image || "/placeholder.png",
            options: data.options || [],
            flavors: data.flavors || [],
            category: data.category || "Snacks",
            isPopular: data.isPopular || false,
            prepTime: data.prepTime || "5-10 min",
            isAvailable: data.isAvailable ?? true,
          } as MenuItem;
        });
        
        setMenuItems(items);
        
        // Extract unique categories
        const uniqueCategories = [
          "All",
          ...new Set(items.map(item => item.category).filter((c): c is string => Boolean(c)))
        ];
        setCategories(uniqueCategories);
        ;
        
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching menu:", error);
        toast.error("Failed to load menu items!");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter items by category
  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // Handle opening item modal
  const openItemModal = (item: MenuItem) => {
    if (item.isOutOfStock) {
      toast.error(`${item.name} is currently out of stock!`);
      return;
    }
    
    setSelectedItem(item);
    
    // Set default option if available
    if (item.options && item.options.length > 0) {
      const availableOption = item.options.find(opt => !opt.isOutOfStock);
      setSelectedOption(availableOption || null);
    } else {
      setSelectedOption(null);
    }
    
    // Set default flavor if available
    if (item.flavors && item.flavors.length > 0) {
      const availableFlavor = item.flavors.find(flavor => !flavor.isOutOfStock);
      setSelectedFlavor(availableFlavor?.name || "");
    } else {
      setSelectedFlavor("");
    }
    
    setQuantity(1);
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (!selectedItem) return;

    // Validate required selections
    if (selectedItem.options && selectedItem.options.length > 0 && !selectedOption) {
      toast.error("Please select a size option.");
      return;
    }

    if (selectedItem.flavors && selectedItem.flavors.length > 0 && !selectedFlavor) {
      toast.error("Please select a flavor.");
      return;
    }

    const cartItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      size: selectedOption?.size || "One Size",
      price: selectedOption?.price || selectedItem.price || 0,
      flavor: selectedFlavor || "No Flavor",
      quantity,
      image: selectedItem.image,
    };

    addToCart(cartItem);
    toast.success(`${quantity}x ${selectedItem.name} added to cart!`);
    closeModal();
  };

  // Close modal
  const closeModal = () => {
    setSelectedItem(null);
    setSelectedOption(null);
    setSelectedFlavor("");
    setQuantity(1);
  };

  // Get cart item count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delicious menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Menu</h1>
        <p className="text-gray-600 text-lg">Freshly made with love, just for you</p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 shadow-lg">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                  : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="menu-list">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className={`menu-item ${item.isOutOfStock ? "out-of-stock" : ""}`}
            onClick={() => openItemModal(item)}
          >
            {/* Popular Badge */}
            {item.isPopular && (
              <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                <Star className="w-3 h-3" fill="currentColor" />
                Popular
              </div>
            )}

            {/* Out of Stock Badge */}
            {item.isOutOfStock && (
              <div className="out-of-stock-badge">
                Out of Stock
              </div>
            )}

            {/* Item Image */}
            <div className="relative overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                className="menu-item-image transition-transform duration-300 hover:scale-110"
                width={400}
                height={250}
                priority
              />
            </div>

            {/* Item Content */}
            <div className="menu-item-content">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                <div className="flex items-center gap-1 text-orange-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {item.prepTime}
                </div>
              </div>
              
              <p className="menu-item-description">{item.description}</p>
              
              {/* Price Display */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-lg font-bold text-orange-600">
                  {item.options && item.options.length > 0 ? (
                    `₱${Math.min(...item.options.map(opt => opt.price))} - ₱${Math.max(...item.options.map(opt => opt.price))}`
                  ) : (
                    `₱${item.price?.toFixed(2) || "0.00"}`
                  )}
                </div>
                
                <button
                  className={`add-to-cart ${item.isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={item.isOutOfStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    openItemModal(item);
                  }}
                >
                  {item.isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found in this category.</p>
        </div>
      )}

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <button
          onClick={() => window.location.href = '/cart'}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            <span className="bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {cartItemCount}
            </span>
          </div>
        </button>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedItem.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Clock className="w-4 h-4" />
                  {selectedItem.prepTime}
                  {selectedItem.isPopular && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4" fill="currentColor" />
                        Popular
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 mb-6">{selectedItem.description}</p>

            {/* Size Options */}
            {selectedItem.options && selectedItem.options.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Choose Size:</h3>
                <div className="options-grid">
                  {selectedItem.options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-card ${selectedOption?.size === option.size ? "selected" : ""} ${option.isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (!option.isOutOfStock) setSelectedOption(option);
                      }}
                      disabled={option.isOutOfStock}
                    >
                      <div className="text-center">
                        <p className="font-semibold">{option.size}</p>
                        <p className="text-orange-600 font-bold">₱{option.price.toFixed(2)}</p>
                        {option.isOutOfStock && (
                          <p className="text-red-500 text-sm font-medium">Out of Stock</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Options */}
            {selectedItem.flavors && selectedItem.flavors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Choose Flavor:</h3>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={selectedFlavor}
                  onChange={(e) => setSelectedFlavor(e.target.value)}
                >
                  <option value="">Select a flavor</option>
                  {selectedItem.flavors.map((flavor, index) => (
                    <option 
                      key={index} 
                      value={flavor.name} 
                      disabled={flavor.isOutOfStock}
                    >
                      {flavor.name} {flavor.isOutOfStock ? "(Out of Stock)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Quantity:</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 p-4 bg-orange-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-orange-600">
                  ₱{((selectedOption?.price || selectedItem.price || 0) * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-buttons">
              <button onClick={closeModal} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={handleAddToCart} 
                className="confirm-btn"
                disabled={
                  selectedItem.isOutOfStock || 
                  (selectedItem.options && selectedItem.options.length > 0 && !selectedOption) ||
                  (selectedItem.flavors && selectedItem.flavors.length > 0 && !selectedFlavor)
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