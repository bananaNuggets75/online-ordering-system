"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

type CartItem = {
  id: string; // ✅ Changed from number to string (to match Firestore IDs)
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  flavor?: string; // ✅ Made flavor optional
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string, flavor?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // ✅ Load cart from local storage on mount
  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // ✅ Sync cart to local storage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  // ✅ Add to cart (size + flavor-based)
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.size === item.size &&
          cartItem.flavor === item.flavor // ✅ Match flavor too
      );

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id &&
          cartItem.size === item.size &&
          cartItem.flavor === item.flavor
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      return [...prevCart, item];
    });

    toast.success(`${item.name} (${item.size}) added to cart!`);
  };

  // ✅ Remove from cart (based on size + flavor)
  const removeFromCart = (id: string, size: string, flavor?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.id === id && item.size === size && (!flavor || item.flavor === flavor))
      )
    );
    toast.success("Item removed from cart.");
  };

  // ✅ Clear cart
  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared!");
  };

  if (!mounted) return null;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// ✅ UseCart Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
