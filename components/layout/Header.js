"use client";
import { CartContext } from "@/components/AppContext";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocationInput from "./LocationInput";

// Lucide React Icons
import {
  Menu,
  ShoppingCart,
  MapPin,
  Bell,
  Store,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Truck,
  Package,
  DollarSign,
  User,
  FileText,
  Heart,
  RotateCcw,
  LogOut,
  Plus,
  CheckCircle,
  AlertCircle,
  Circle,
  X,
} from "lucide-react";
import NotificationBell from "./Notification";
import { AuthLinks } from "./AuthLinks";

export default function Header() {
  const { isAuthenticated, user, userType, userName, logout } = useAuth();
  const { cartProducts } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Function to calculate total cart amount
  const getCartTotal = () => {
    if (!cartProducts || cartProducts.length === 0) return 0;
    return cartProducts.reduce((total, product) => {
      return total + product.price * (product.quantity || 1);
    }, 0);
  };

  // Function to generate a temporary order ID (you might want to replace this with actual logic)
  const generateOrderId = () => {
    return Date.now().toString();
  };

  // Function to get cart URL with query parameters
  const getCartUrl = () => {
    const orderId = generateOrderId();
    const amount = getCartTotal().toFixed(2);
    return `/payments?orderId=${orderId}&amount=${amount}`;
  };

  const getBrandName = () => {
    switch (userType) {
      case "restaurant_owner":
        return "RestaurantHub";
      case "delivery_driver":
        return "DriveEats";
      default:
        return "CESI(EATS)";
    }
  };

  const getNavLinks = () => {
    switch (userType) {
      case "restaurant_owner":
        return [
          { href: "/restaurant", label: "Dashboard" },
          { href: "/restaurant/orders", label: "Orders" },
          { href: "/restaurant/menu", label: "Menu" },
          { href: "/restaurant/earnings", label: "Earnings" },
          { href: "/restaurant/settings", label: "Settings" },
          { href: "/restaurant/notifications", label: "Notifications" },
        ];
      case "delivery_driver":
        return [
          { href: "/delivery", label: "Dashboard" },
          { href: "/delivery/deliveries", label: "Deliveries" },
          { href: "/delivery/earnings", label: "Earnings" },
        ];
      default:
        return [
          { href: "/", label: "Home" },
          { href: "/browse-restaurants", label: "Restaurants" },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="px-4 py-3 bg-white shadow-sm border-b border-gray-100">
      {/* Mobile Navigation */}
      <div className="flex items-center md:hidden justify-between">
        <Link className="text-yellow-500 font-bold text-xl" href={"/"}>
          {getBrandName()}
        </Link>

        <div className="flex gap-2 items-center">
          {/* Mobile Cart for customers */}
          {isAuthenticated && userType === "end_user" && (
            <Link
              href={getCartUrl()}
              className="relative p-2 hover:text-yellow-500 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartProducts?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs py-1 px-2 rounded-full leading-3 min-w-[18px] text-center font-medium">
                  {cartProducts.length}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Notifications */}
          {isAuthenticated && userType !== "end_user" && (
            <NotificationBell userType={userType} />
          )}

          <button
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-yellow-400 transition-colors"
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="md:hidden p-4 bg-white border border-gray-200 rounded-lg mt-4 flex flex-col gap-3 text-center shadow-lg"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-gray-600 hover:text-yellow-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-200">
            <AuthLinks
              isAuthenticated={isAuthenticated}
              user={user}
              userType={userType}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between">
        <nav className="flex items-center gap-6 text-gray-600 font-medium">
          <span className="text-black font-bold text-2xl mr-4">
            {getBrandName()}
          </span>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-yellow-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-gray-600 font-medium">
            <AuthLinks
              isAuthenticated={isAuthenticated}
              user={user}
              userType={userType}
              onLogout={handleLogout}
            />

            {/* Desktop Cart for customers */}
            {isAuthenticated && userType === "end_user" && (
              <Link
                href={getCartUrl()}
                className="relative p-2 hover:text-yellow-500 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartProducts?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs py-1 px-2 rounded-full leading-3 min-w-[20px] text-center font-medium">
                    {cartProducts.length}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop Notifications */}
            {isAuthenticated && userType !== "end_user" && (
              <NotificationBell userType={userType} />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
