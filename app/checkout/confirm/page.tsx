"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; 
import Image from "next/image";
import { db } from "@/lib/firebase";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";

export default function ConfirmPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [/*orderStatus*/, /*setOrderStatus*/] = useState("pending");
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
    toast.success("Order placed! Your payment will be verified.");
    toast((t) => (
      <div className="flex flex-col items-center">
        <p>Go to Order Status</p>
        <button 
          className="bg-blue-500 text-white px-4 py-1 rounded mt-2"
          onClick={() => {
            router.push("/order-status"); 
            toast.dismiss(t.id);
          }}
        >
          View Order
        </button>
      </div>
    ));
  
    setShowQR(false); // Hide QR after confirmation
  };
  

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        status: newStatus, 
        updatedAt: serverTimestamp(),
      });
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };
  

  const handlePaymentSelection = (paymentMethod: string) => {
    if (!orderId) return; // Ensure orderId exists
  
    const isConfirmed = window.confirm(`Are you sure you want to pay using ${paymentMethod}?`);
    if (isConfirmed) {
      const newStatus = paymentMethod === "gcash" ? "Awaiting Payment" : "To be Paid";
      updateOrderStatus(orderId, newStatus);
      
      toast.success(
        paymentMethod === "gcash"
          ? "Awaiting payment confirmation..."
          : "Order placed successfully! Please pay upon delivery."
      );
    }
  };
  
  
  

  /*const handleCODPayment = () => {
    // Simulate order status update
    setOrderStatus("To be Paid");
    toast.success("Order placed successfully! Please pay upon delivery.");
  };*/

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
        <button onClick={() => handlePaymentSelection("cod")}
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
