"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentForm from "../../components/PaymentForm";
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "@/data/CartContext";
import { OrderAPI } from "@/libs/api";

// Separate component that uses useSearchParams
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    tax,
    total,
    itemCount,
    clearCart,
  } = useCart();

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  useEffect(() => {
    // Check if we have items in cart
    if (itemCount === 0) {
      // Try to get pending order data from localStorage
      const pendingOrder = localStorage.getItem("pendingOrder");
      if (pendingOrder) {
        try {
          const parsedOrder = JSON.parse(pendingOrder);
          setPendingOrderData(parsedOrder.orderData);
        } catch (error) {
          console.error("Error parsing pending order:", error);
        }
      }
    }

    if (orderId) {
      getOrderBasicDetailsFromContext();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [orderId, itemCount]);

  const getOrderBasicDetailsFromContext = () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get pending order from localStorage
      const pendingOrder = localStorage.getItem("pendingOrder");
      if (!pendingOrder) {
        throw new Error("No pending order found. Please return to checkout.");
      }

      const parsedPendingOrder = JSON.parse(pendingOrder);
      const { orderData } = parsedPendingOrder;

      if (!orderData) {
        throw new Error("Invalid pending order data");
      }

      // Create order details from stored data
      const basicOrderDetails = {
        id: orderId,
        orderNumber: `ORD-${orderId?.slice(-8)?.toUpperCase() || "PENDING"}`,
        customer: orderData.delivery
          ? {
              firstName: orderData.delivery.firstName,
              lastName: orderData.delivery.lastName,
              email: orderData.delivery.email,
              phone: orderData.delivery.phone,
            }
          : null,
        delivery: orderData.delivery,
        payment: orderData.paymentMethod
          ? {
              method: orderData.paymentMethod,
              status: "pending",
              amount: orderData.totals?.total || total,
            }
          : null,
        status: "pending_payment",
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        totals: orderData.totals || {
          subtotal: parseFloat(subtotal),
          deliveryFee: parseFloat(deliveryFee),
          tax: parseFloat(tax),
          total: parseFloat(total),
          discount: 0,
          tip: 0,
        },
      };

      // Validate required data
      if (!basicOrderDetails.customer) {
        throw new Error(
          "Customer information not found. Please return to checkout."
        );
      }

      if (!basicOrderDetails.delivery) {
        throw new Error(
          "Delivery information not found. Please return to checkout."
        );
      }

      if (!basicOrderDetails.payment) {
        throw new Error(
          "Payment information not found. Please return to checkout."
        );
      }

      // Verify payment method is card
      if (basicOrderDetails.payment.method !== "card") {
        throw new Error("This order is not set up for card payment");
      }

      // Verify amount matches if provided
      if (
        amount &&
        Math.abs(parseFloat(amount) - basicOrderDetails.totals.total) > 0.01
      ) {
        console.warn(
          `Amount mismatch: URL has ${amount}, order context has ${basicOrderDetails.totals.total}`
        );
      }

      // Check if we have items in cart or localStorage
      if (itemCount === 0 && !orderData.items) {
        throw new Error("No order items found. Please return to checkout.");
      }

      setOrderDetails(basicOrderDetails);
    } catch (error) {
      console.error("Error getting order details from context:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      console.log("Payment successful:", paymentIntent);

      // Update order status to confirmed and add payment details
      // Since we're working with context data, we'll make a simpler API call
      const updateResponse = await OrderAPI.updateOrder(orderId, {
        status: "confirmed",

        payment_id: paymentIntent.id,
      });

      console.log("Update response:", updateResponse);

      if (updateResponse.status === 200) {
        // Clear the cart since payment was successful
        clearCart();

        // Remove pending order from localStorage
        localStorage.removeItem("pendingOrder");

        // Redirect to success page
        router.push(
          `/order-success?orderId=${orderId}&paymentId=${paymentIntent.id}`
        );
      } else {
        console.error("Failed to update order status");

        // Even if update fails, clear local data since payment succeeded
        clearCart();
        localStorage.removeItem("pendingOrder");

        // Still redirect to success since payment went through
        router.push(
          `/order-success?orderId=${orderId}&paymentId=${paymentIntent.id}&warning=status_update_failed`
        );
      }
    } catch (error) {
      console.error("Error handling payment success:", error);

      // Clear local data since payment succeeded
      clearCart();
      localStorage.removeItem("pendingOrder");

      // Still redirect to success since payment went through
      router.push(
        `/order-success?orderId=${orderId}&paymentId=${paymentIntent.id}&warning=update_error`
      );
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);

    // You could redirect to an error page or show an error message
    // For now, we'll just log it and let the PaymentForm handle the display
  };

  // Helper function to get item display name
  const getItemDisplayName = (item) => {
    let name = item.name;

    if (item.size && item.size.name) {
      name += ` (${item.size.name})`;
    }

    if (item.extras && item.extras.length > 0) {
      const extrasNames = item.extras.map((extra) => extra.name).join(", ");
      name += ` + ${extrasNames}`;
    }

    return name;
  };

  // Helper function to calculate item total price
  const getItemTotalPrice = (item) => {
    let price = item.basePrice || item.price || 0;

    if (item.size && item.size.price) {
      price += item.size.price;
    }

    if (item.extras && item.extras.length > 0) {
      price += item.extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
    }

    return price;
  };

  // Get current order data (from cart or localStorage)
  const getCurrentOrderData = () => {
    if (itemCount > 0 && restaurant) {
      // Use current cart data
      return {
        items,
        restaurant,
        totals: {
          subtotal: parseFloat(subtotal),
          deliveryFee: parseFloat(deliveryFee),
          tax: parseFloat(tax),
          total: parseFloat(total),
          discount: 0,
          tip: 0,
        },
      };
    } else if (pendingOrderData) {
      // Use data from localStorage
      return pendingOrderData;
    }
    return null;
  };

  const currentOrderData = getCurrentOrderData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Checkout
              </button>
              <button
                onClick={() => router.push("/restaurants")}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails || !currentOrderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find your order details. Your cart may have expired or
              been cleared.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/restaurants")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start New Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/checkout")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Complete Payment</h1>
              <p className="text-sm text-gray-600">
                Order #{orderDetails.orderNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Order Summary
            </h2>

            {/* Restaurant Info */}
            <div className="border-b pb-4 mb-6">
              <h3 className="font-semibold text-lg text-gray-900">
                {currentOrderData.restaurant.name}
              </h3>
              <p className="text-gray-600">Order #{orderDetails.orderNumber}</p>
              {currentOrderData.restaurant.address && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentOrderData.restaurant.address}
                </p>
              )}
            </div>

            {/* Customer Info */}
            <div className="border-b pb-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Delivery Details
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">
                  {orderDetails.customer.firstName}{" "}
                  {orderDetails.customer.lastName}
                </p>
                <p>{orderDetails.delivery.address}</p>
                {orderDetails.delivery.apartment && (
                  <p>Apt: {orderDetails.delivery.apartment}</p>
                )}
                <p>
                  {orderDetails.delivery.city},{" "}
                  {orderDetails.delivery.postalCode}
                </p>
                <p>{orderDetails.customer.phone}</p>
              </div>
            </div>

            {/* Items List - From Cart */}
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-900">Order Items</h4>
              {currentOrderData.items.map((item, index) => {
                const itemTotalPrice = getItemTotalPrice(item);
                const lineTotal = itemTotalPrice * item.quantity;

                return (
                  <div
                    key={item.cartItemId || index}
                    className="flex items-start gap-3 py-2"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjEyIiB5PSIxMiIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjI0IiB5PSIyOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOUI5Q0EwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn42944KAAAA8L3RleHQ+Cjwvc3ZnPgo=";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-lg">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 text-sm">
                        {getItemDisplayName(item)}
                      </h5>
                      <p className="text-xs text-gray-600">
                        €{itemTotalPrice.toFixed(2)} each
                      </p>
                      {item.extras && item.extras.length > 0 && (
                        <p className="text-xs text-gray-500">
                          + {item.extras.map((extra) => extra.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">{item.quantity}x</p>
                      <p className="text-sm font-semibold text-gray-900">
                        €{lineTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals Breakdown - From Cart */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  €{currentOrderData.totals.subtotal.toFixed(2)}
                </span>
              </div>

              {currentOrderData.totals.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-€{currentOrderData.totals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  €{currentOrderData.totals.deliveryFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  €{currentOrderData.totals.tax.toFixed(2)}
                </span>
              </div>

              {currentOrderData.totals.tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tip</span>
                  <span className="font-medium">
                    €{currentOrderData.totals.tip.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>€{currentOrderData.totals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            {orderDetails.estimatedDeliveryTime && (
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Estimated Delivery:{" "}
                    {new Date(
                      orderDetails.estimatedDeliveryTime
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Payment Details
            </h2>

            <PaymentForm
              orderId={orderId}
              amount={currentOrderData.totals.total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Your payment is secured with SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for the suspense fallback
function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded-md w-40 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-md w-32"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loading Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded-md w-32"></div>
              </div>

              {/* Restaurant Info */}
              <div className="border-b pb-4 mb-6">
                <div className="h-5 bg-gray-200 rounded-md w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-md w-64"></div>
              </div>

              {/* Customer Info */}
              <div className="border-b pb-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-24"></div>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-3 bg-gray-200 rounded-md w-full"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-gray-200 rounded-md w-24 mb-4"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                      <div className="h-3 bg-gray-200 rounded-md w-2/3"></div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <div className="h-3 bg-gray-200 rounded-md w-8"></div>
                      <div className="h-4 bg-gray-200 rounded-md w-12"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded-md w-16"></div>
                    <div className="h-3 bg-gray-200 rounded-md w-12"></div>
                  </div>
                ))}
              </div>

              {/* Estimated Time */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded-md w-40"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded-md w-32"></div>
              </div>

              {/* Payment Form */}
              <div className="space-y-6">
                {/* Card Number */}
                <div>
                  <div className="h-4 bg-gray-200 rounded-md w-24 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 bg-gray-200 rounded-md w-16 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded-md w-12 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <div className="h-4 bg-gray-200 rounded-md w-32 mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>

                {/* Pay Button */}
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded-md w-48"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
