"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Truck,
  Star,
  Download,
  Share2,
  Home,
  Package,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "@/data/CartContext";
import { OrderAPI, RestaurantAPI, driverAPI } from "@/libs/api";

export default function OrderSuccessPage() {
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
  const paymentId = searchParams.get("paymentId");
  const paymentMethod = searchParams.get("paymentMethod");
  const warning = searchParams.get("warning");

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingSteps, setTrackingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [dataSource, setDataSource] = useState("api"); // 'api', 'context', 'localStorage'

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    } else {
      setError("No order information found");
      setLoading(false);
    }
  }, [orderId]);

  // Real-time tracking updates
  useEffect(() => {
    if (!orderDetails?.id) return;

    const interval = setInterval(async () => {
      try {
        // Fetch real-time tracking updates
          const trackingData = await OrderAPI.getOrderTracking(orderDetails.id);
          
          console.log("Real-time tracking data:", trackingData);
        if (trackingData?.currentStep !== undefined) {
          setCurrentStep(trackingData.currentStep);
        }

        // Update delivery tracking if available
        if (deliveryDetails?.id) {
          const deliveryTracking = await driverAPI.getDeliveryTracking(
            deliveryDetails.id
          );
          if (deliveryTracking) {
            setDeliveryDetails((prev) => ({ ...prev, ...deliveryTracking }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch real-time updates:", error);
        // Fallback to simulated updates
        setCurrentStep((prev) => Math.min(prev + 1, trackingSteps.length - 1));
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [orderDetails?.id, deliveryDetails?.id, trackingSteps.length]);

  const fetchOrderData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Primary: Try to fetch from API
      await fetchFromAPI();
    } catch (apiError) {
      console.warn(
        "API fetch failed, falling back to context/localStorage:",
        apiError
      );

      try {
        // Fallback: Use context and localStorage
        await fetchFromContextAndStorage();
      } catch (fallbackError) {
        console.error("All data sources failed:", fallbackError);
        setError("Unable to load order information");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFromAPI = async () => {
    try {
      // Fetch order details with full information
      const orderData = await OrderAPI.getOrderWithDetails(orderId);

      console.log("Fetched order data:", orderData);

   

      // Fetch delivery details
      let deliveryData = null;
      try {
        deliveryData = await driverAPI.trackDelivery(orderId);
        setDeliveryDetails(deliveryData);
      } catch (deliveryError) {
        console.warn("Delivery fetch failed:", deliveryError);
      }

      // Fetch tracking information
      try {
        const trackingData = await OrderAPI.getOrderTracking(orderId);
        if (trackingData?.steps) {
          setTrackingSteps(trackingData.steps);
          setCurrentStep(trackingData.currentStep || 0);
        } else {
          initializeDefaultTracking();
        }
      } catch (trackingError) {
        console.warn("Tracking fetch failed, using default:", trackingError);
        initializeDefaultTracking();
      }

      // Process and set order details
      const processedOrder = {
        ...orderData,
        paymentMethod:
          paymentData?.method || paymentMethod || orderData.paymentMethod,
        paymentId: paymentData?.id || paymentId,
        delivery: deliveryData || orderData.delivery || orderData.customer,
        estimatedDeliveryTime:
          deliveryData?.estimatedArrival || orderData.estimatedDeliveryTime,
      };

      setOrderDetails(processedOrder);
      setEstimatedTime(new Date(processedOrder.estimatedDeliveryTime));
      setDataSource("api");

      // Clear cart after successful API fetch
      if (clearCart) {
        clearCart();
      }

      // Save to localStorage as backup
      localStorage.setItem("lastOrder", JSON.stringify(processedOrder));
    } catch (error) {
      console.error("API fetch error:", error);
      throw error;
    }
  };

  const fetchFromContextAndStorage = async () => {
    try {
      // Try to get from localStorage first
      const lastOrder = localStorage.getItem("lastOrder");
      const pendingOrder = localStorage.getItem("pendingOrder");

      console.log("Last order from localStorage:", lastOrder);
      console.log("Pending order from localStorage:", pendingOrder);

      let storedOrderData = null;
      let deliveryInfo = null;

      if (lastOrder) {
        const parsedLastOrder = JSON.parse(lastOrder);
        if (
          parsedLastOrder.id === orderId ||
          parsedLastOrder.orderNumber?.includes(orderId?.slice(-6))
        ) {
          storedOrderData = parsedLastOrder;
          deliveryInfo =
            parsedLastOrder.delivery || parsedLastOrder.deliveryInfo;
        }
      }

      if (!storedOrderData && pendingOrder) {
        const parsedPendingOrder = JSON.parse(pendingOrder);
        storedOrderData = parsedPendingOrder.orderData;
        deliveryInfo =
          storedOrderData?.delivery || storedOrderData?.deliveryInfo;
      }

      // Combine data from different sources
      const order = {
        id: orderId,
        orderNumber: `ORD-${
          orderId?.slice(-8)?.toUpperCase() || Date.now().toString().slice(-6)
        }`,

        // Items: prefer context, fallback to stored data
        items: items.length > 0 ? items : storedOrderData?.items || [],

        // Restaurant: prefer context, fallback to stored data
        restaurant: restaurant?.id
          ? restaurant
          : storedOrderData?.restaurant || {},

        // Delivery info from stored data
        delivery: deliveryInfo || {},
        customer: deliveryInfo || {},

        // Totals: prefer context, fallback to stored data
        totals:
          items.length > 0
            ? {
                subtotal: parseFloat(subtotal),
                deliveryFee: parseFloat(deliveryFee),
                tax: parseFloat(tax),
                total: parseFloat(total),
                discount: 0,
                tip: 0,
              }
            : storedOrderData?.totals || { total: 0 },

        paymentMethod:
          paymentMethod || storedOrderData?.paymentMethod || "card",
        paymentId: paymentId || storedOrderData?.paymentId,
        status: "confirmed",
        estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000),
        placedAt: new Date().toISOString(),
      };

      // If we have minimal data, create a basic order confirmation
      if (!order.items.length && !deliveryInfo) {
        order.items = [];
        order.totals = { total: 0 };
        setDataSource("minimal");
      } else {
        setDataSource(items.length > 0 ? "context" : "localStorage");
      }

      setOrderDetails(order);

      console.log("Fetched order from context/localStorage:", order);
      setEstimatedTime(order.estimatedDeliveryTime);
      initializeDefaultTracking();
    } catch (error) {
      console.error("Context/Storage fetch error:", error);
      throw error;
    }
  };

  const initializeDefaultTracking = () => {
    const steps = [
      {
        title: "Order Confirmed",
        description: "Your order has been received and confirmed",
        icon: CheckCircle,
        time: new Date(),
        completed: true,
      },
      {
        title: "Restaurant Preparing",
        description: "Your food is being prepared",
        icon: Package,
        time: new Date(Date.now() + 5 * 60 * 1000),
        completed: false,
      },
      {
        title: "Ready for Pickup",
        description: "Your order is ready and waiting for driver",
        icon: Clock,
        time: new Date(Date.now() + 20 * 60 * 1000),
        completed: false,
      },
      {
        title: "Out for Delivery",
        description: "Driver is on the way to you",
        icon: Truck,
        time: new Date(Date.now() + 25 * 60 * 1000),
        completed: false,
      },
      {
        title: "Delivered",
        description: "Your order has been delivered. Enjoy!",
        icon: Home,
        time: new Date(Date.now() + 35 * 60 * 1000),
        completed: false,
      },
    ];

    setTrackingSteps(steps);
    setCurrentStep(0);
  };

  const retryFetchOrder = async () => {
    setError(null);
    await fetchOrderData();
  };

  const copyOrderNumber = async () => {
    if (orderDetails?.orderNumber) {
      try {
        await navigator.clipboard.writeText(orderDetails.orderNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const getItemDisplayName = (item) => {
    let name = item.name || "Food Item";

    if (item.size && item.size.name) {
      name += ` (${item.size.name})`;
    }

    if (item.extras && item.extras.length > 0) {
      const extrasNames = item.extras.map((extra) => extra.name).join(", ");
      name += ` + ${extrasNames}`;
    }

    return name;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching from {dataSource === "api" ? "server" : "local storage"}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Order Information Unavailable
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={retryFetchOrder}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading
              </button>
              <button
                onClick={() => router.push("/restaurants")}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="mb-4">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-200" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-green-100 text-lg">
              Thank you for your order. We're preparing your delicious meal!
            </p>
          </div>

          {/* Order Number */}
          <div className="bg-white/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-green-100 text-sm mb-1">Order Number</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold">
                {orderDetails?.id}
              </span>
              <button
                onClick={copyOrderNumber}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Copy order number"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-200" />
                ) : (
                  <Copy className="w-4 h-4 text-green-200" />
                )}
              </button>
            </div>
            {/* Data source indicator */}
            <p className="text-xs text-green-200 mt-1 opacity-75">
              Data loaded from:{" "}
              {dataSource === "api"
                ? "Server"
                : dataSource === "context"
                ? "Current session"
                : "Local storage"}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {warning && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="max-w-4xl mx-auto flex items-start">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Payment Processed Successfully
              </h3>
             
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Tracking */}
          <div className="space-y-6">
            {/* Estimated Delivery Time */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Estimated Delivery
              </h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {estimatedTime?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <p className="text-gray-600">
                  Approximately{" "}
                  {Math.ceil((estimatedTime - new Date()) / (1000 * 60))}{" "}
                  minutes
                </p>
                {deliveryDetails?.driverName && (
                  <p className="text-sm text-blue-600 mt-2">
                    Driver: {deliveryDetails.driverName}
                  </p>
                )}
              </div>
            </div>

            {/* Order Status Tracking */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Order Status</h2>
              <div className="space-y-4">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep || step.completed;

                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-blue-500 text-white animate-pulse"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium ${
                            isCompleted || isActive
                              ? "text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            isCompleted || isActive
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.description}
                        </p>
                        {(isCompleted || isActive) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {step.time.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Information */}
            {orderDetails?.restaurant && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Restaurant Contact
                </h2>
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">
                    {orderDetails.restaurant.name}
                  </h3>
                  {orderDetails.restaurant.phone && (
                    <a
                      href={`tel:${orderDetails.restaurant.phone}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">
                        {orderDetails.restaurant.phone}
                      </span>
                    </a>
                  )}
                  {orderDetails.restaurant.address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {orderDetails.restaurant.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Items */}
              {orderDetails?.items && orderDetails.items.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {orderDetails.items.map((item, index) => {
                    const itemTotalPrice = getItemTotalPrice(item);
                    const lineTotal = itemTotalPrice * (item.quantity || 1);

                    return (
                      <div
                        key={item.cartItemId || item.id || index}
                        className="flex items-start gap-3"
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
                          <h4 className="font-medium text-sm">
                            {getItemDisplayName(item)}
                          </h4>
                          <p className="text-xs text-gray-600">
                            €{itemTotalPrice.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm">{item.quantity || 1}x</p>
                          <p className="font-medium">€{lineTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Order items not available</p>
                  <p className="text-xs mt-1">
                    Order confirmed but details are being processed
                  </p>
                </div>
              )}

              {/* Totals */}
              {orderDetails?.totals && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>
                      €{(orderDetails.totals.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {orderDetails.totals.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-€{orderDetails.totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>
                      €{(orderDetails.totals.deliveryFee || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>€{(orderDetails.totals.tax || 0).toFixed(2)}</span>
                  </div>
                  {orderDetails.totals.tip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tip</span>
                      <span>€{orderDetails.totals.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total</span>
                    <span>€{(orderDetails.totals.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Payment Confirmed
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="capitalize">
                    {orderDetails?.paymentMethod === "card"
                      ? "Credit Card"
                      : orderDetails?.paymentMethod || "Card"}
                  </span>
                </div>
                {(paymentId || orderDetails?.paymentId) && (
                  <div className="flex justify-between">
                    <span>Transaction ID</span>
                    <span className="font-mono text-xs">
                      {(paymentId || orderDetails?.paymentId)?.slice(0, 20)}...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-600 font-medium">
                    ✓ {paymentDetails?.status || "Paid"}
                  </span>
                </div>
                {paymentDetails?.processedAt && (
                  <div className="flex justify-between">
                    <span>Processed At</span>
                    <span className="text-xs">
                      {new Date(paymentDetails.processedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            {(orderDetails?.delivery || orderDetails?.customer) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Delivery Address
                </h2>
                {(() => {
                  const delivery =
                    orderDetails.delivery || orderDetails.customer || {};
                  return (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-900">
                        {delivery.firstName} {delivery.lastName}
                      </p>
                      <p>{delivery.address}</p>
                      {delivery.apartment && <p>Apt: {delivery.apartment}</p>}
                      <p>
                        {delivery.city}, {delivery.postalCode}
                      </p>
                      <p>{delivery.phone}</p>
                      {delivery.instructions && (
                        <p className="mt-2 text-gray-500">
                          <strong>Instructions:</strong> {delivery.instructions}
                        </p>
                      )}
                      {deliveryDetails?.trackingCode && (
                        <p className="mt-2 text-blue-600">
                          <strong>Tracking Code:</strong>{" "}
                          {deliveryDetails.trackingCode}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Real-time Delivery Updates */}
            {deliveryDetails?.driverLocation && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Live Delivery Updates
                </h2>
                <div className="space-y-3">
                  {deliveryDetails.driverName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Driver:</span>
                      <span className="font-medium">
                        {deliveryDetails.driverName}
                      </span>
                      {deliveryDetails.driverRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">
                            {deliveryDetails.driverRating}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {deliveryDetails.estimatedArrival && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">ETA:</span>
                      <span className="font-medium">
                        {new Date(
                          deliveryDetails.estimatedArrival
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {deliveryDetails.currentLocation && (
                    <div className="text-sm text-gray-600">
                      <span>Current location: </span>
                      <span className="text-gray-800">
                        {deliveryDetails.currentLocation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/orders")}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Orders
              </button>
              <button
                onClick={() => router.push("/restaurants")}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Order Again
              </button>
              {dataSource !== "api" && (
                <button
                  onClick={retryFetchOrder}
                  className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh from Server
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Debug Information (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">
              Debug Information
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Data Source: {dataSource}</p>
              <p>Order ID: {orderId}</p>
              <p>Payment ID: {paymentId}</p>
              <p>Has Items: {orderDetails?.items?.length > 0 ? "Yes" : "No"}</p>
              <p>
                Has Restaurant: {orderDetails?.restaurant?.name ? "Yes" : "No"}
              </p>
              <p>Has Delivery Info: {orderDetails?.delivery ? "Yes" : "No"}</p>
              <p>Context Items: {items.length}</p>
              <p>
                Tracking Step: {currentStep}/{trackingSteps.length - 1}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
