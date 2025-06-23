"use client";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  AlertTriangle,
  Truck,
  Clock,
} from "lucide-react";
import { CartContext, cartProductPrice } from "@/components/AppContext";

function FloatingCart({ restaurant = null, className = "" }) {
  const router = useRouter();
  const { cartProducts, addToCart, removeCartProduct } =
    useContext(CartContext);
  const [showCart, setShowCart] = useState(false);

  // Calculate cart totals
  const getCartTotal = () => {
    return cartProducts.reduce(
      (total, item) => total + cartProductPrice(item),
      0
    );
  };

  const getTotalItems = () => {
    return cartProducts.length;
  };

  // Check if restaurant is open (if restaurant prop is provided)
  const isRestaurantOpen = () => {
    if (!restaurant) return true; // If no restaurant provided, assume open

    if (restaurant.isOpenNow !== undefined) {
      return restaurant.isOpenNow;
    }

    if (restaurant.isOpen !== undefined) {
      return restaurant.isOpen;
    }

    // Fallback to opening hours calculation
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const todayHours = restaurant.openingHours?.[currentDay];
    if (!todayHours || todayHours.isClosed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const isOpen = isRestaurantOpen();

  // Don't render if cart is empty
  if (cartProducts.length === 0) {
    return null;
  }

  const handleCheckout = () => {
    console.log("Proceeding to checkout with cart:", cartProducts);
    setShowCart(false);
    router.push("/checkout");
  };

  const deliveryFee = restaurant ? parseFloat(restaurant.deliveryFee || 0) : 0;
  const minimumOrder = restaurant
    ? parseFloat(restaurant.minimumOrder || 0)
    : 0;
  const cartTotal = getCartTotal();
  const finalTotal = cartTotal + deliveryFee;

  return (
    <>
      {/* Floating Cart Button */}
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setShowCart(true)}
          className="bg-black text-white px-6 py-4 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-3 transform hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">
            {getTotalItems()} items • €{cartTotal.toFixed(2)}
          </span>
        </button>
      </div>

      {/* Cart Modal/Sidebar */}
      {showCart && (
        <div className="fixed inset-0  bg-opacity-20 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-4 border-b sticky top-0 bg-white z-10 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Your Order</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {restaurant && (
                <p className="text-sm text-gray-600 mt-1">{restaurant.name}</p>
              )}
            </div>

            <div className="p-4">
              {/* Warning if restaurant is closed */}
              {restaurant && !isOpen && cartProducts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Restaurant Closed
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Items will remain in your cart, but you cannot checkout
                        while the restaurant is closed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-3">
                {cartProducts.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                      }
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>

                      {/* Size info */}
                      {item.size && (
                        <p className="text-xs text-gray-600 mt-1">
                          Size: {item.size.name} (+€{item.size.price.toFixed(2)}
                          )
                        </p>
                      )}

                      {/* Extras info */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Extras:{" "}
                          {item.extras
                            .map(
                              (extra) =>
                                `${extra.name} (+€${extra.price.toFixed(2)})`
                            )
                            .join(", ")}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-green-600">
                          €{cartProductPrice(item).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeCartProduct(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">€{cartTotal.toFixed(2)}</span>
                </div>

                {restaurant && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Truck className="w-3 h-3 mr-1" />
                        Delivery fee
                      </span>
                      <span className="font-medium">
                        €{deliveryFee.toFixed(2)}
                      </span>
                    </div>

                    {restaurant.averageDeliveryTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Delivery time
                        </span>
                        <span className="font-medium">
                          {restaurant.averageDeliveryTime} min
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span className="text-green-600">
                    €{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={
                  (restaurant && !isOpen) ||
                  (minimumOrder > 0 && cartTotal < minimumOrder)
                }
                className={`w-full mt-6 py-4 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  (restaurant && isOpen && cartTotal >= minimumOrder) ||
                  !restaurant
                    ? "bg-black text-white hover:bg-gray-800 transform hover:scale-[1.02]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {restaurant && !isOpen
                  ? "Restaurant Closed - Cannot Order"
                  : minimumOrder > 0 && cartTotal < minimumOrder
                  ? `Minimum order €${minimumOrder.toFixed(2)}`
                  : "Proceed to Checkout"}
              </button>

              {/* Minimum order warning */}
              {restaurant &&
                isOpen &&
                minimumOrder > 0 &&
                cartTotal < minimumOrder && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 text-center">
                      Add €{(minimumOrder - cartTotal).toFixed(2)} more to reach
                      minimum order
                    </p>
                  </div>
                )}

              {/* Continue Shopping */}
              <button
                onClick={() => setShowCart(false)}
                className="w-full mt-3 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingCart;
