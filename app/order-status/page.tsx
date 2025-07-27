"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Clock, MapPin, Phone, Package, CheckCircle, Truck } from "lucide-react";

interface Order {
  id: string;
  queueNumber: number;
  customerInfo: {
    name: string;
    contact: string;
    deliveryType: "Pickup" | "Delivery";
    deliveryLocation?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    flavor?: string;
    price: number;
  }>;
  totalPrice: number;
  status: string;
  timestamp: any;
  updatedAt: any;
}

const OrderStatusPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Listen for real-time updates on active orders
    const q = query(
      collection(db, "orders"),
      orderBy("queueNumber", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          queueNumber: data.queueNumber || 0,
          customerInfo: data.customerInfo || {},
          items: data.items || [],
          totalPrice: data.totalPrice || 0,
          status: data.status || "Pending",
          timestamp: data.timestamp,
          updatedAt: data.updatedAt,
        };
      }) as Order[];

      // Filter out completed orders and sort by queue number
      const activeOrders = ordersData
        .filter((order) => !["Completed", "Order Received"].includes(order.status))
        .sort((a, b) => a.queueNumber - b.queueNumber);

      setOrders(activeOrders);
      setLoading(false);

      // Play notification sound for ready orders
      activeOrders.forEach((order) => {
        if (["Ready for Pickup", "Out for Delivery"].includes(order.status)) {
          playNotificationSound();
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/new-order.mp3");
      audio.play().catch((error) => console.log("Audio playback failed:", error));
    } catch (error) {
      console.log("Audio not available");
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          message: 'Your order is being prepared'
        };
      case 'to be paid':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package,
          message: 'Please pay when you pickup/receive'
        };
      case 'awaiting payment':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package,
          message: 'Waiting for payment confirmation'
        };
      case 'in-process':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Package,
          message: 'Your delicious order is being prepared!'
        };
      case 'ready for pickup':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          message: 'Ready! Please pickup your order'
        };
      case 'out for delivery':
        return {
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: Truck,
          message: 'On the way to you!'
        };
      case 'paid (completed)':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          message: 'Order completed successfully!'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          message: 'Processing your order'
        };
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Status</h1>
          <p className="text-gray-600">Track your delicious orders in real-time</p>
        </div>

        {/* Live Queue Display */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Live Queue</h2>
            <p className="text-orange-100">
              {orders.length > 0 
                ? `${orders.length} order${orders.length > 1 ? 's' : ''} in queue`
                : "No active orders"
              }
            </p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                          #{order.queueNumber}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {order.customerInfo.name || "Customer"}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Ordered at {formatTime(order.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-full border ${statusInfo.color} flex items-center gap-2`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="font-semibold">{order.status}</span>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-xl ${statusInfo.color.replace('border-', 'bg-').replace('text-', '').replace('bg-', 'bg-opacity-10 text-')}`}>
                      <p className="text-sm font-medium">{statusInfo.message}</p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Customer Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{order.customerInfo.contact || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>
                              {order.customerInfo.deliveryType === "Delivery" 
                                ? `Delivery: ${order.customerInfo.deliveryLocation || "N/A"}`
                                : "Pickup"
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.quantity}x {item.name}
                                {item.size !== "One Size" && ` (${item.size})`}
                                {item.flavor && item.flavor !== "No Flavor" && ` - ${item.flavor}`}
                              </span>
                              <span className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span className="text-orange-600">₱{order.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Active Orders</h3>
            <p className="text-gray-600 mb-8">
              You don't have any orders in queue right now.
            </p>
            <button
              onClick={() => window.location.href = '/menu'}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Browse Menu
            </button>
          </div>
        )}

        {/* Auto-refresh Notice */}
        {orders.length > 0 && (
          <div className="text-center mt-8 p-4 bg-white/50 rounded-xl">
            <p className="text-sm text-gray-600">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              This page updates automatically - no need to refresh!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;