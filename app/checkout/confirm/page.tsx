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

  // to do: 
  // current implementation, right?
  // place order -> payment (confirm page) if they haven't paid then the status in admin dashboard is "to be paid" 
  // else we process the order 
  // the admin will check it manually if the they recieve the payment then that is the time we will process the orders

  // if ever the customer didn't pick up it will prompt delivery? but would this be necessary when we already have forms to specify the delivery
  // also how can we prompt delivery when we do not know their location in the first place? stupid ahh thinking. i am not sure if i understand what my client wanted, but that is my approach


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
    if (!orderId) return;

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
    <div className="confirm-container flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800">Order Confirmed</h1>
        <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
        <p className="text-lg font-semibold text-gray-700 mt-2">Order ID: {orderId}</p>
  
        <div className="payment-options mt-6">
          <h2 className="text-xl font-bold text-gray-800">Select Payment Method</h2>
  
          {/* GCash Button */}
          <button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition"
            onClick={() => setShowQR(true)}
          >
            Pay with GCash
          </button>
  
          {/* Cash on Delivery Button */}
          <button 
            onClick={() => handlePaymentSelection("cod")}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg mt-2 transition"
          >
            Over the Counter Payment
          </button>
        </div>
  
        {/* Show QR Code when GCash is selected */}
        {showQR && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-800">Scan QR Code to Pay</h3>
            <div className="flex justify-center mt-4">
              <Image src="/path/to/image.jpg" alt="QR Code" width={200} height={200} className="rounded-lg shadow-md" />
            </div>
            <p className="text-gray-600 mt-4">After payment, click below:</p>
            <button 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg mt-4 transition"
              onClick={handlePaymentConfirm}
            >
              I Have Paid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}  