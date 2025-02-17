"use client"; // Required for using state & context

import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600">₱{item.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <button 
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
          
          {/* Total Price & Actions */}
          <div className="mt-4">
            <p className="text-xl font-bold">Total: ₱{totalPrice.toFixed(2)}</p>
            <div className="flex gap-2 mt-2">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => alert("Proceeding to checkout...")}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
