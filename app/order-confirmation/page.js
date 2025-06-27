// app/order-confirmation/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Phone,
  Receipt,
  User,
} from "lucide-react";

// Separate component that uses useSearchParams
function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");

  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState("confirmed");

  useEffect(() => {
    if (orderId && paymentId) {
      fetchOrderDetails();
      fetchPaymentDetails();
    }
  }, [orderId, paymentId]);

  const fetchOrderDetails = async () => {
    try {
      // In real app, fetch from your order service
      // For demo, we'll simulate the data
      setTimeout(() => {
        setOrderData({
          id: orderId,
          orderNumber: `FD-${orderId.slice(-6).toUpperCase()}`,
          status: "confirmed",
          estimatedDelivery: new Date(Date.now() + 45 * 60000), // 45 minutes from now
          restaurant: {
            name: "Best Burgers & More",
            phone: "+1 (555) 123-4567",
            address: "123 Restaurant St, Food City, FC 12345",
            image: "/api/placeholder/120/120",
          },
          customer: {
            name: "John Doe",
            phone: "+1 (555) 987-6543",
            email: "john.doe@example.com",
          },
          deliveryAddress: {
            street: "456 Home Ave, Apt 2B",
            city: "Food City, FC 54321",
            instructions: "Ring doorbell, leave at door",
          },
          driver: {
            name: "Mike Wilson",
            phone: "+1 (555) 456-7890",
            vehicle: "Honda Civic - Blue",
            license: "ABC-123",
          },
          items: [
            {
              id: 1,
              name: "Classic Burger Deluxe",
              description:
                "Beef patty, lettuce, tomato, onion, pickles, special sauce",
              price: 12.99,
              quantity: 1,
              customizations: ["No onions", "Extra cheese"],
            },
            {
              id: 2,
              name: "Crispy French Fries",
              description: "Golden crispy fries with sea salt",
              price: 4.99,
              quantity: 1,
              customizations: [],
            },
            {
              id: 3,
              name: "Chocolate Milkshake",
              description: "Rich chocolate milkshake with whipped cream",
              price: 5.99,
              quantity: 1,
              customizations: ["Extra whipped cream"],
            },
          ],
          pricing: {
            subtotal: 23.97,
            deliveryFee: 2.99,
            serviceFee: 1.5,
            tax: 2.29,
            tip: 3.0,
            total: 33.75,
          },
          placedAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      // In real app, fetch from your payment service
      setPaymentData({
        id: paymentId,
        status: "succeeded",
        amount: 33.75,
        currency: "usd",
        paymentMethod: {
          type: "card",
          brand: "visa",
          last4: "4242",
          exp_month: 12,
          exp_year: 2025,
        },
        receiptUrl: `https://pay.stripe.com/receipts/${paymentId}`,
      });
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "preparing":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "ready":
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case "out_for_delivery":
        return <Truck className="h-6 w-6 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Order Confirmed";
      case "preparing":
        return "Being Prepared";
      case "ready":
        return "Ready for Pickup";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return "Processing";
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Order not found</p>
          <p className="text-gray-600">
            Please check your order ID and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your order. We're preparing your delicious meal!
          </p>
          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-2xl font-bold text-gray-900">
              {orderData.orderNumber}
            </p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Order Status</h2>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center text-center flex-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-600">Confirmed</p>
                <p className="text-xs text-gray-500">
                  {formatTime(orderData.placedAt)}
                </p>
              </div>

              <div className="flex flex-col items-center text-center flex-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100 mb-2">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-yellow-600">Preparing</p>
                <p className="text-xs text-gray-500">~5-10 min</p>
              </div>

              <div className="flex flex-col items-center text-center flex-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2">
                  <Truck className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  Out for Delivery
                </p>
                <p className="text-xs text-gray-500">~30-40 min</p>
              </div>

              <div className="flex flex-col items-center text-center flex-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2">
                  <CheckCircle className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-400">Delivered</p>
                <p className="text-xs text-gray-500">~45 min</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4 inline-block">
                <p className="text-sm text-blue-800 font-medium">
                  Estimated delivery: {formatTime(orderData.estimatedDelivery)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant & Delivery Info */}
          <div className="space-y-6">
            {/* Restaurant Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Restaurant</h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍔</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {orderData.restaurant.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {orderData.restaurant.address}
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{orderData.restaurant.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">
                    {orderData.deliveryAddress.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {orderData.deliveryAddress.city}
                  </p>
                  {orderData.deliveryAddress.instructions && (
                    <p className="text-sm text-blue-600 mt-2">
                      <span className="font-medium">Instructions:</span>{" "}
                      {orderData.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Driver Info (when assigned) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Driver</h3>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {orderData.driver.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {orderData.driver.vehicle}
                  </p>
                  <div className="flex items-center text-sm text-blue-600 mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{orderData.driver.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                          {item.quantity}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-8">
                        {item.description}
                      </p>
                      {item.customizations.length > 0 && (
                        <div className="ml-8 mt-2">
                          {item.customizations.map((custom, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mr-1"
                            >
                              {custom}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 ml-4">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatCurrency(orderData.pricing.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">
                    {formatCurrency(orderData.pricing.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="text-gray-900">
                    {formatCurrency(orderData.pricing.serviceFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    {formatCurrency(orderData.pricing.tax)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tip</span>
                  <span className="text-gray-900">
                    {formatCurrency(orderData.pricing.tip)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(orderData.pricing.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {paymentData && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center mr-3">
                        {paymentData.paymentMethod.brand.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">
                        •••• •••• •••• {paymentData.paymentMethod.last4}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-600">
                        Paid
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {paymentData.id}
                    </span>
                  </div>
                  {paymentData.receiptUrl && (
                    <div className="pt-3 border-t">
                      <a
                        href={paymentData.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        View Receipt
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Track Order Live
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Contact Support
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Order Again
            </button>
          </div>
        </div>

        {/* Support & Help */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-700 mb-4">
            Having issues with your order? Our support team is here to help
            24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15551234567"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              📞 Call Support: (555) 123-4567
            </a>
            <a
              href="mailto:support@fooddelivery.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ✉️ Email: support@fooddelivery.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for the suspense fallback
function OrderConfirmationLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Loading Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-pulse">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-md w-96 mx-auto mb-4"></div>
            <div className="bg-gray-200 rounded-lg p-4 w-48 h-16 mx-auto"></div>
          </div>
        </div>

        {/* Loading Order Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md w-32 mb-6"></div>
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded-md w-12"></div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="bg-gray-200 rounded-lg p-4 w-64 h-12 mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded-md w-24 mb-4"></div>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded-md"></div>
                      <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded-md w-24 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded-md"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
