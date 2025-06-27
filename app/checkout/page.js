"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Home,
  Building,
  User,
  Edit3,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Shield,
  Gift,
  Percent,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "@/data/CartContext";
import { OrderAPI } from "@/libs/api";

const CheckoutPage = () => {
  const router = useRouter();
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    tax,
    total,
    itemCount,
    updateQuantity,
    removeItem,
    meetsMinimumOrder,
    minimumOrderRemaining,
    clearCart,
  } = useCart();

  // Form states
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    deliveryInstructions: "",
  });

  const [orderOptions, setOrderOptions] = useState({
    deliveryTime: "asap",
    scheduledTime: "",
    scheduledDate: "",
    paymentMethod: "card",
    addTip: true,
    tipAmount: 2.0,
    tipType: "amount", // 'amount' or 'percentage'
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Delivery, 2: Review
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Load saved data from localStorage
  useEffect(() => {
    const savedDeliveryInfo = localStorage.getItem("deliveryInfo");

    if (savedDeliveryInfo) {
      try {
        setDeliveryInfo(JSON.parse(savedDeliveryInfo));
      } catch (error) {
        console.error("Error parsing saved delivery info:", error);
      }
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (itemCount === 0) {
      router.push("/restaurants");
    }
  }, [itemCount, router]);

  // Save delivery info to localStorage
  useEffect(() => {
    if (deliveryInfo.firstName || deliveryInfo.email) {
      localStorage.setItem("deliveryInfo", JSON.stringify(deliveryInfo));
    }
  }, [deliveryInfo]);

  // Calculate totals with tip
  const calculateFinalTotals = () => {
    const baseSubtotal = subtotal - promoDiscount;
    const tipAmount = orderOptions.addTip
      ? orderOptions.tipType === "percentage"
        ? baseSubtotal * (orderOptions.tipAmount / 100)
        : orderOptions.tipAmount
      : 0;

    return {
      subtotal: baseSubtotal,
      deliveryFee,
      tax,
      tip: tipAmount,
      discount: promoDiscount,
      total: baseSubtotal + deliveryFee + tax + tipAmount,
    };
  };

  const finalTotals = calculateFinalTotals();

  // Form validation
  const validateDeliveryInfo = () => {
    const newErrors = {};

    if (!deliveryInfo.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!deliveryInfo.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!deliveryInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(deliveryInfo.email))
      newErrors.email = "Invalid email format";
    if (!deliveryInfo.phone.trim())
      newErrors.phone = "Phone number is required";
    if (!deliveryInfo.address.trim()) newErrors.address = "Address is required";
    if (!deliveryInfo.city.trim()) newErrors.city = "City is required";
    if (!deliveryInfo.postalCode.trim())
      newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function formatBody(data) {
    return {
      restaurant_id: data.restaurant.uuid,
      payment_id: null,
      delivery_address: data.delivery.address,
      items: data.items.map((item) => ({
        item_id: item.uuid,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    }
    
  // Create order and proceed to payment
  const createOrderAndProceedToPayment = async () => {
    if (!validateDeliveryInfo()) {
      setCurrentStep(1);
      return;
    }

    if (!meetsMinimumOrder) {
      alert(
        `Minimum order of €${
          restaurant?.minimumOrder || 0
        } required. Add €${minimumOrderRemaining.toFixed(2)} more to continue.`
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        items: items.map((item) => ({
          uuid: item.uuid,
          name: item.name,
          description: item.description,
          price: item.basePrice || item.price,
          quantity: item.quantity,
          size: item.size,
          extras: item.extras,
          cartItemId: item.cartItemId,
        })),
        restaurant: {
          uuid: restaurant.uuid,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
        },
        delivery: {
          ...deliveryInfo,
          instructions: deliveryInfo.deliveryInstructions,
          scheduledDelivery:
            orderOptions.deliveryTime === "scheduled"
              ? {
                  date: orderOptions.scheduledDate,
                  time: orderOptions.scheduledTime,
                }
              : null,
        },
        totals: {
          subtotal: finalTotals.subtotal,
          deliveryFee: finalTotals.deliveryFee,
          tax: finalTotals.tax,
          tip: finalTotals.tip,
          discount: finalTotals.discount,
          total: finalTotals.total,
        },
        paymentMethod: orderOptions.paymentMethod,
        status: "pending_payment",
        createdAt: new Date().toISOString(),
        };
        

        // parse body to
        // {
        //     "restaurant_id": "string",
        //     "payment_id": "string",
        //     "delivery_address": "string",
        //     "items": [
        //       {
        //         "item_id": 0,
        //         "quantity": 0,
        //         "price": 0
        //       }
        //     ]
        
        // };

        const formattedBody = formatBody(orderData);
 
        const response = await OrderAPI.createOrder(formattedBody);
        
        console.log("Order creation response:", response);


        if (!response.orderId) {
            throw new Error("Failed to create order");
        }

        const orderID = response?.orderId || response?.id;

        console.log("Order creation result:", response);
      


      //  Create order for the restaurant




      
      // Save order data locally for reference
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          orderId: orderID,
          orderData,
          timestamp: Date.now(),
        })
      );

      // Handle payment based on method
      if (orderOptions.paymentMethod === "card") {
        // Redirect to payment page with order details
        const paymentUrl = `/payments?orderId=${orderID}&amount=${finalTotals.total.toFixed(
          2
        )}`;
        router.push(paymentUrl);
      } else if (orderOptions.paymentMethod === "cash") {
        // For cash payments, mark order as confirmed and redirect to success
        await confirmCashOrder(orderID);
      }
    } catch (error) {
      console.error("Error creating order:", error);
     
    } finally {
      setLoading(false);
    }
  };

  // Confirm cash order
  const confirmCashOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm-cash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Clear cart and redirect to success
        clearCart();
        localStorage.removeItem("pendingOrder");
        router.push(`/order-success?orderId=${orderId}&paymentMethod=cash`);
      } else {
        throw new Error("Failed to confirm cash order");
      }
    } catch (error) {
      console.error("Error confirming cash order:", error);
      alert("Failed to confirm order. Please try again.");
    }
  };

  // Apply promo code
  const applyPromoCode = () => {
    const validCodes = {
      SAVE10: 10,
      WELCOME5: 5,
      FREEDELIV: deliveryFee,
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setPromoDiscount(validCodes[promoCode.toUpperCase()]);
      setPromoCode("");
    } else {
      alert("Invalid promo code");
    }
  };

  const DeliveryInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Delivery Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={deliveryInfo.firstName}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={deliveryInfo.lastName}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={deliveryInfo.email}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={deliveryInfo.phone}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({ ...prev, phone: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="+33 1 23 45 67 89"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={deliveryInfo.address}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="123 Main Street"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apartment/Suite
            </label>
            <input
              type="text"
              value={deliveryInfo.apartment}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  apartment: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apt 4B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={deliveryInfo.city}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({ ...prev, city: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Paris"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              value={deliveryInfo.postalCode}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  postalCode: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.postalCode ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="75001"
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions
            </label>
            <textarea
              value={deliveryInfo.deliveryInstructions}
              onChange={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  deliveryInstructions: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ring doorbell, leave at door, etc."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Delivery Time */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Delivery Time
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="deliveryTime"
              value="asap"
              checked={orderOptions.deliveryTime === "asap"}
              onChange={(e) =>
                setOrderOptions((prev) => ({
                  ...prev,
                  deliveryTime: e.target.value,
                }))
              }
              className="text-blue-600"
            />
            <div>
              <div className="font-medium">As soon as possible</div>
              <div className="text-sm text-gray-600">
                {restaurant?.averageDeliveryTime || 30}-
                {(restaurant?.averageDeliveryTime || 30) + 10} minutes
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="deliveryTime"
              value="scheduled"
              checked={orderOptions.deliveryTime === "scheduled"}
              onChange={(e) =>
                setOrderOptions((prev) => ({
                  ...prev,
                  deliveryTime: e.target.value,
                }))
              }
              className="text-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium">Schedule for later</div>
              {orderOptions.deliveryTime === "scheduled" && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={orderOptions.scheduledDate}
                    onChange={(e) =>
                      setOrderOptions((prev) => ({
                        ...prev,
                        scheduledDate: e.target.value,
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <input
                    type="time"
                    value={orderOptions.scheduledTime}
                    onChange={(e) =>
                      setOrderOptions((prev) => ({
                        ...prev,
                        scheduledTime: e.target.value,
                      }))
                    }
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" />
          Payment Method
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={orderOptions.paymentMethod === "card"}
              onChange={(e) =>
                setOrderOptions((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="text-blue-600"
            />
            <CreditCard className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">Credit/Debit Card</div>
              <div className="text-sm text-gray-600">
                Pay securely with your card
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={orderOptions.paymentMethod === "cash"}
              onChange={(e) =>
                setOrderOptions((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="text-blue-600"
            />
            <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white text-xs">€</span>
            </div>
            <div>
              <div className="font-medium">Cash on Delivery</div>
              <div className="text-sm text-gray-600">
                Pay when your order arrives
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Tip Section */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-blue-600" />
          Add Tip for Driver
        </h4>

        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={orderOptions.addTip}
            onChange={(e) =>
              setOrderOptions((prev) => ({ ...prev, addTip: e.target.checked }))
            }
            className="rounded text-blue-600"
          />
          <span className="text-sm text-gray-700">Add tip for your driver</span>
        </label>

        {orderOptions.addTip && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setOrderOptions((prev) => ({ ...prev, tipType: "amount" }))
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  orderOptions.tipType === "amount"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Amount
              </button>
              <button
                onClick={() =>
                  setOrderOptions((prev) => ({
                    ...prev,
                    tipType: "percentage",
                  }))
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  orderOptions.tipType === "percentage"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Percentage
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {orderOptions.tipType === "amount" ? "€" : ""}
              </span>
              <input
                type="number"
                step={orderOptions.tipType === "amount" ? "0.50" : "1"}
                min="0"
                value={orderOptions.tipAmount}
                onChange={(e) =>
                  setOrderOptions((prev) => ({
                    ...prev,
                    tipAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {orderOptions.tipType === "percentage" ? "%" : ""}
              </span>
              <span className="text-sm text-gray-600">
                = €
                {(orderOptions.tipType === "percentage"
                  ? subtotal * (orderOptions.tipAmount / 100)
                  : orderOptions.tipAmount
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Check className="w-5 h-5 text-green-600" />
        Review Your Order
      </h3>

      {/* Order Summary */}
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Delivery Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p>
              <strong>
                {deliveryInfo.firstName} {deliveryInfo.lastName}
              </strong>
            </p>
            <p>{deliveryInfo.address}</p>
            {deliveryInfo.apartment && <p>Apt: {deliveryInfo.apartment}</p>}
            <p>
              {deliveryInfo.city}, {deliveryInfo.postalCode}
            </p>
            <p>{deliveryInfo.phone}</p>
            {deliveryInfo.deliveryInstructions && (
              <p className="mt-2 text-gray-600">
                Note: {deliveryInfo.deliveryInstructions}
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Delivery Time</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            {orderOptions.deliveryTime === "asap" ? (
              <p>
                As soon as possible ({restaurant?.averageDeliveryTime || 30}-
                {(restaurant?.averageDeliveryTime || 30) + 10} minutes)
              </p>
            ) : (
              <p>
                Scheduled for {orderOptions.scheduledDate} at{" "}
                {orderOptions.scheduledTime}
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Payment Method</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            {orderOptions.paymentMethod === "card" ? (
              <p>Credit/Debit Card (you will be redirected to payment page)</p>
            ) : (
              <p>Cash on Delivery</p>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="border-t pt-6">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 rounded text-blue-600"
            required
          />
          <span className="text-sm text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-blue-600 underline">
              Terms and Conditions
            </a>{" "}
            and
            <a href="#" className="text-blue-600 underline ml-1">
              Privacy Policy
            </a>
          </span>
        </label>
      </div>
    </div>
  );

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checking out.
          </p>
          <button
            onClick={() => router.push("/restaurants")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Checkout</h1>
            </div>

            {/* Mobile Order Summary Toggle */}
            <button
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="lg:hidden flex items-center gap-2 text-blue-600"
            >
              <span className="text-sm font-medium">
                Order Total: €{finalTotals.total.toFixed(2)}
              </span>
              {showOrderSummary ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-4">
            {[
              { number: 1, title: "Details", icon: MapPin },
              { number: 2, title: "Review", icon: Check },
              { number: 3, title: "Payment", icon: CreditCard },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < 2 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Minimum Order Warning */}
            {!meetsMinimumOrder && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800">
                      Minimum Order Required
                    </h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Add €{minimumOrderRemaining.toFixed(2)} more to reach the
                      minimum order of €
                      {restaurant?.minimumOrder?.toFixed(2) || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Restaurant Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  🏪
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{restaurant?.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant?.averageDeliveryTime || 30} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant?.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Steps */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {currentStep === 1 && <DeliveryInfoStep />}
              {currentStep === 2 && <ReviewStep />}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}

                <div className="ml-auto">
                  {currentStep < 2 ? (
                    <button
                      onClick={() => {
                        if (validateDeliveryInfo()) {
                          setCurrentStep(2);
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Continue to Review
                    </button>
                  ) : (
                    <button
                      onClick={createOrderAndProceedToPayment}
                      disabled={loading || !meetsMinimumOrder}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        loading || !meetsMinimumOrder
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : orderOptions.paymentMethod === "card"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : orderOptions.paymentMethod === "card" ? (
                        `Proceed to Payment - €${finalTotals.total.toFixed(2)}`
                      ) : (
                        `Confirm Order - €${finalTotals.total.toFixed(2)}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className={`lg:block ${showOrderSummary ? "block" : "hidden"}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const itemPrice = item.basePrice || item.price || 0;
                  const sizePrice = item.size?.price || 0;
                  const extrasPrice =
                    item.extras?.reduce(
                      (sum, extra) => sum + (extra.price || 0),
                      0
                    ) || 0;
                  const totalItemPrice = itemPrice + sizePrice + extrasPrice;

                  return (
                    <div
                      key={item.cartItemId}
                      className="flex items-start gap-3"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">
                            🍽️
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.name}
                        </h4>
                        {item.size && (
                          <p className="text-xs text-gray-600">
                            Size: {item.size.name}
                          </p>
                        )}
                        {item.extras && item.extras.length > 0 && (
                          <p className="text-xs text-gray-600">
                            +{" "}
                            {item.extras.map((extra) => extra.name).join(", ")}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  item.quantity - 1
                                )
                              }
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  item.quantity + 1
                                )
                              }
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              €{(totalItemPrice * item.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeItem(item.cartItemId)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    Apply
                  </button>
                </div>
                {promoDiscount > 0 && (
                  <div className="mt-2 text-green-600 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Promo applied: -€{promoDiscount.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-€{promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span>€{deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>

                {orderOptions.addTip && finalTotals.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>€{finalTotals.tip.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>€{finalTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Preview */}
              {currentStep >= 2 && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    {orderOptions.paymentMethod === "card" ? (
                      <>
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">Card Payment</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs">€</span>
                        </div>
                        <span className="text-gray-700">Cash on Delivery</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-600 text-xs">
                <Shield className="w-4 h-4" />
                <span>Secure checkout protected by SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
