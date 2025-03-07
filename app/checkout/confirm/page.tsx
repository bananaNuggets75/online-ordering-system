"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; 
import Image from "next/image";

export default function ConfirmPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [/*orderStatus*/, setOrderStatus] = useState("pending");
  const [showQR, setShowQR] = useState(false); // State for showing QR code
  const router = useRouter();

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("orderId");
    if (!storedOrderId) {
      router.push("/cart"); // Redirect back if no order ID is found
    } else {
      setOrderId(storedOrderId);
    }
  }, [router]);

  // Handle Payment Confirmation
  const handlePaymentConfirm = () => {
    toast.success("Payment confirmed!"); // Show success toast
    setShowQR(false); // Optionally hide QR after confirmation
  };

  const handleCODPayment = () => {
    // Simulate order status update
    setOrderStatus("To be Paid");
    toast.success("Order placed successfully! Please pay upon delivery.");
  };

  if (!orderId) return <p>Loading...</p>;

  return (
    <div className="confirm-container text-center">
      <h1 className="text-2xl font-bold">Order Confirmed</h1>
      <p className="text-gray-600">Your order has been placed successfully.</p>
      <p className="text-lg font-semibold">Order ID: {orderId}</p>

      <div className="payment-options mt-4">
        <h2 className="text-xl font-bold">Select Payment Method</h2>
        
        {/* GCash Button */}
        <button 
          className="pay-btn bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
          onClick={() => setShowQR(true)}
        >
          Pay with GCash
        </button>

        {/* Cash on Delivery Button */}
        <button onClick={handleCODPayment}
          className="pay-btn bg-gray-500 text-white px-4 py-2 rounded-lg mt-2 ml-2"
        >
          Cash on Delivery
        </button>
      </div>

      {/* Show QR Code when GCash is selected */}
      {showQR && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Scan QR Code to Pay</h3>
          <Image src="/path/to/image.jpg" alt="QR Code" width={300} height={300} />
          <p className="text-gray-600 mt-2">After payment, click below:</p>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2"
            onClick={handlePaymentConfirm}
          >
            I Have Paid
          </button>
        </div>
      )}
    </div>
  );
}
