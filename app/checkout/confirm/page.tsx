"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle, Clock, Smartphone, MapPin, CreditCard } from "lucide-react";

export default function ConfirmPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("Pending");
  const [showQR, setShowQR] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem("orderId");
    const storedQueueNumber = sessionStorage.getItem("queueNumber");
    const storedPaymentMethod = sessionStorage.getItem("paymentMethod");
    
    if (!storedOrderId) {
      router.push("/cart");
      return;
    }
    
    setOrderId(storedOrderId);
    setQueueNumber(storedQueueNumber);
    setPaymentMethod(storedPaymentMethod);

    // Show QR immediately if payment method is GCash
    if (storedPaymentMethod === 'gcash') {
      setShowQR(true);
    }

    // Listen for order status changes
    const unsubscribe = onSnapshot(
      doc(db, "orders", storedOrderId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrderStatus(data.status || "Pending");
          
          // Auto-redirect to order status if payment is confirmed
          if (data.status === "Pending" || data.status === "In-Process") {
            setPaymentConfirmed(true);
          }
        }
      },
      (error) => {
        console.error("Error listening for order updates:", error);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const handlePaymentConfirmed = async () => {
    if (!orderId) return;
    
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Pending",
        updatedAt: serverTimestamp(),
      });
      
      setPaymentConfirmed(true);
      setShowQR(false);
      toast.success("Payment confirmed! Your order is now being processed.");
      
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to confirm payment. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'awaiting payment': return 'text-blue-600 bg-blue-50';
      case 'in-process': return 'text-purple-600 bg-purple-50';
      case 'ready for pickup': return 'text-green-600 bg-green-50';
      case 'out for delivery': return 'text-indigo-600 bg-indigo-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order. We're preparing it with love!</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              #{queueNumber || "..."}
            </div>
            <p className="text-gray-600">Your Queue Number</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono text-sm">{orderId.slice(-8)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(orderStatus)}`}>
                {orderStatus}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold capitalize">
                {paymentMethod === 'gcash' ? 'GCash' : 'Cash'}
              </span>
            </div>
          </div>
        </div>

        {/* GCash Payment Section */}
        {showQR && !paymentConfirmed && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Smartphone className="w-6 h-6 text-blue-500" />
                Scan to Pay with GCash
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <Image 
                  src="/forms.png" 
                  alt="GCash QR Code" 
                  width={200} 
                  height={200} 
                  className="mx-auto rounded-lg shadow-md"
                />
              </div>
              
              <div className="text-sm text-gray-600 mb-6">
                <p className="mb-2">1. Open your GCash app</p>
                <p className="mb-2">2. Scan the QR code above</p>
                <p className="mb-2">3. Complete the payment</p>
                <p>4. Click "I Have Paid" below</p>
              </div>
              
              <button 
                onClick={handlePaymentConfirmed}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
              >
                I Have Paid
              </button>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            What's Next?
          </h3>
          
          <div className="space-y-3">
            {paymentMethod === 'gcash' && !paymentConfirmed ? (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Complete Payment</p>
                  <p className="text-sm text-gray-600">Scan the QR code above to pay with GCash</p>
                </div>
              </div>
            ) : null}
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-600 text-sm font-bold">{paymentMethod === 'gcash' && !paymentConfirmed ? '2' : '1'}</span>
              </div>
              <div>
                <p className="font-medium">Order Preparation</p>
                <p className="text-sm text-gray-600">We'll start preparing your delicious order</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm font-bold">{paymentMethod === 'gcash' && !paymentConfirmed ? '3' : '2'}</span>
              </div>
              <div>
                <p className="font-medium">Ready for Pickup/Delivery</p>
                <p className="text-sm text-gray-600">You'll be notified when your order is ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/order-status')}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Track Order Status
          </button>
          
          <button
            onClick={() => router.push('/menu')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Order More Items
          </button>
        </div>

        {/* Estimated Time */}
        <div className="text-center mt-8 p-4 bg-white/50 rounded-xl">
          <p className="text-sm text-gray-600">
            <Clock className="w-4 h-4 inline mr-1" />
            Estimated preparation time: <strong>10-15 minutes</strong>
          </p>
        </div>
      </div>
    </div>
  );
}