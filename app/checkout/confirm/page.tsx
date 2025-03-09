"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; 
import Image from "next/image";
import { db } from "@/lib/firebase";
import { runTransaction, doc, onSnapshot, updateDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export default function ConfirmPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("orderId");
    if (!storedOrderId) {
      router.push("/cart"); // Redirect if no order ID found
    } else {
      setOrderId(storedOrderId);
      const unsubscribe = listenForQueueNumber(storedOrderId);
      return () => unsubscribe();
    }
  }, [router]);

  const listenForQueueNumber = (orderId: string) => {
    const orderRef = doc(db, "orders", orderId);
    return onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().queueNumber) {
        setQueueNumber(docSnap.data().queueNumber);
      }
    }, (error) => {
      console.error("Error listening for queue number:", error);
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, queueNumber?: number) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(queueNumber && { queueNumber })
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  const handlePaymentSelection = async (paymentMethod: string) => {
    if (!orderId) return;

    if (paymentMethod === "gcash") {
      setShowQR(true);
      updateOrderStatus(orderId, "Awaiting Payment");
      return;
    }

    toast((t) => (
        <div className="toast-container">
          <p className="toast-message">
            Are you sure you want to pay using <b>Over the Counter</b>?
          </p>
          <div className="toast-actions">
            <button 
              onClick={() => toast.dismiss(t.id)} 
              className="toast-btn toast-cancel"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await assignQueueNumberAndConfirm(orderId, "To be Paid");
              }}
              className="toast-btn toast-confirm"
            >
              Confirm
            </button>
          </div>
        </div>
      ), { duration: 5000 });      
    }
      

  const assignQueueNumberAndConfirm = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
  
      await runTransaction(db, async (transaction) => {
        // Get the highest queue number
        const q = query(collection(db, "orders"), orderBy("queueNumber", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        const highestQueueNumber = querySnapshot.docs[0]?.data().queueNumber || 0;
        const nextQueueNumber = highestQueueNumber + 1;
  
        // Update the order with the queue number
        transaction.update(orderRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
          queueNumber: nextQueueNumber,
        });
  
        setQueueNumber(nextQueueNumber);
      });
  
      setPaymentConfirmed(true);
      toast.success("Order placed successfully! Please pay upon delivery.");
    } catch (error) {
      console.error("Error assigning queue number:", error);
      toast.error("Failed to assign queue number. Please try again.");
    }
  };

  const handlePaymentConfirmed = async () => {
    if (!orderId) return;
    await assignQueueNumberAndConfirm(orderId, "Processing");
    setShowQR(false);
  };

  if (!orderId) return <p>Loading...</p>;

  return (
    <div className="confirm-container flex flex-col items-center justify-center min-h-screen p-6">
      <div className="confirm-card shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="confirm-title">Order Confirmed</h1>
        <p className="confirm-message">Your order has been placed successfully.</p>
        <p className="confirm-queue">Queue Number: {queueNumber ?? "Waiting..."}</p>
        <p className="confirm-order-id">(Order ID: {orderId})</p>
  
        {paymentConfirmed ? (
          <button 
            className="confirm-status-btn"
            onClick={() => router.push("/order-status")}
          >
            View Order Status
          </button>
        ) : (
          <div className="payment-options">
            <h2 className="payment-title">Select Payment Method</h2>
            <button 
              className="payment-btn gcash-btn"
              onClick={() => handlePaymentSelection("gcash")}
            >
              Pay with GCash
            </button>
            <button 
              onClick={() => handlePaymentSelection("cod")} 
              className="payment-btn cod-btn"
            >
              Over the Counter Payment
            </button>
          </div>
        )}
  
        {showQR && (
          <div className="qr-section">
            <h3 className="qr-title">Scan QR Code to Pay</h3>
            <div className="qr-container">
              <Image src="/path/to/qr-code.jpg" alt="QR Code" width={200} height={200} className="qr-image" />
            </div>
            <p className="qr-instruction">After payment, click below:</p>
            <button 
              className="qr-confirm-btn"
              onClick={handlePaymentConfirmed}
            >
              I Have Paid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
