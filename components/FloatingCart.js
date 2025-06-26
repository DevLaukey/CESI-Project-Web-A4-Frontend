"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ArrowRight,
  Clock,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { useCart } from "@/components/AppContext";
import Image from "next/image";

const FloatingCart = ({ restaurant }) => {
  const router = useRouter();
  const {
    items,
    total,
    subtotal,
    deliveryFee,
    tax,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
    meetsMinimumOrder,
    minimumOrderRemaining,
  } = useCart();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Don't show cart if empty
  if (itemCount === 0) return null;

  const handleCheckout = () => {
    if (!meetsMinimumOrder) {
      alert(
        `Minimum order of €${
          restaurant?.minimumOrder || 0
        } required. Add €${minimumOrderRemaining.toFixed(2)} more to continue.`
      );
      return;
    }
    router.push("/checkout");
  };

  const getItemPrice = (item) => {
    let price = item.basePrice || item.price || 0;

    if (item.size && item.size.price) {
      price += item.size.price;
    }

    if (item.extras && item.extras.length > 0) {
      price += item.extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
    }

    return price;
  };

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

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2 min-w-max"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {itemCount}
            </span>
          </div>
          <span className="font-medium">€{total.toFixed(2)}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded Cart Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsExpanded(false)}
          />

          {/* Cart Panel */}
          <div className="absolute bottom-0 right-0 left-0 sm:left-auto sm:w-96 bg-white rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none shadow-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Your Order</h3>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Restaurant Info */}
            {restaurant && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    🏪
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {restaurant.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {restaurant.averageDeliveryTime || 30} min delivery
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Minimum Order Warning */}
            {!meetsMinimumOrder && restaurant?.minimumOrder && (
              <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">
                      Minimum order: €
                      {parseFloat(restaurant.minimumOrder).toFixed(2)}
                    </p>
                    <p className="text-yellow-700">
                      Add €{minimumOrderRemaining.toFixed(2)} more to continue
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3"
                >
                  {/* Item Image */}
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {getItemDisplayName(item)}
                    </h4>
                    <p className="text-green-600 font-medium text-sm">
                      €{getItemPrice(item).toFixed(2)} each
                    </p>
                    {item.extras && item.extras.length > 0 && (
                      <p className="text-xs text-gray-500 truncate">
                        + {item.extras.map((extra) => extra.name).join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.cartItemId, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.cartItemId)}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                    title="Remove item"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery fee</span>
                  <span className="font-medium">€{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">€{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={!meetsMinimumOrder}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                  meetsMinimumOrder
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Clear Cart?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove all items from your cart? This
              action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                  setIsExpanded(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCart;
