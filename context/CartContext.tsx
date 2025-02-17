"use client"; // Ensure this is at the top

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

// Define the shape of a cart item
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

// Define the shape of the context
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [lastRemovedItem, setLastRemovedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (lastAddedItem) {
      toast.success(`${lastAddedItem.name} added to cart!`, {
        position: "top-center",
        duration: 3000,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
          padding: "10px",
        },
      });
    }
  }, [lastAddedItem]);

  useEffect(() => {
    if (lastRemovedItem) {
      toast.success(`${lastRemovedItem.name} removed from cart!`, {
        position: "top-center",
        duration: 3000,
        style: {
          fontSize: "16px",
          fontWeight: "bold",
          padding: "10px",
        },
      });
    }
  }, [lastRemovedItem]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      return [...prevCart, item];
    });
    setLastAddedItem(item); // Set the last added item for the notification
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find((item) => item.id === id);
      if (!itemToRemove) return prevCart; // Prevent errors

      setLastRemovedItem(itemToRemove); // Set the last removed item for the notification
      return prevCart.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared!", {
      position: "top-center",
      duration: 3000,
      style: {
        fontSize: "16px",
        fontWeight: "bold",
        padding: "10px",
      },
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
