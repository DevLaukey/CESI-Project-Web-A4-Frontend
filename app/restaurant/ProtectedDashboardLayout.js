"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { restaurantAPI } from "@/libs/api";
import {
  BarChart3,
  ClipboardList,
  UtensilsCrossed,
  Pizza,
  Truck,
  TrendingUp,
  Users,
  Settings,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Menu,
  X,
  Power,
  PowerOff,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const NAVIGATION_ITEMS = [
  {
    id: "overview",
    name: "Overview",
    icon: BarChart3,
    href: "/restaurant",
    count: null,
  },
  {
    id: "orders",
    name: "Orders",
    icon: ClipboardList,
    href: "/restaurant/orders",
    count: 8,
  },
  {
    id: "menu",
    name: "Menu Management",
    icon: UtensilsCrossed,
    href: "/restaurant/menu",
    count: null,
  },
  {
    id: "items",
    name: "Items",
    icon: Pizza,
    href: "/restaurant/items",
    count: null,
  },
  {
    id: "delivery",
    name: "Delivery Tracking",
    icon: Truck,
    href: "/restaurant/delivery",
    count: 3,
  },
  {
    id: "history",
    name: "Order History",
    icon: TrendingUp,
    href: "/restaurant/history",
    count: null,
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
    href: "/restaurant/analytics",
    count: null,
  },
  {
    id: "referrals",
    name: "Referrals",
    icon: Users,
    href: "/restaurant/referrals",
    count: null,
  },
  {
    id: "account",
    name: "Account Settings",
    icon: Settings,
    href: "/restaurant/account",
    count: null,
  },
];

function NavigationItem({ item, isActive, onClick }) {
  const IconComponent = item.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center space-x-3">
        <IconComponent size={18} />
        <span className="font-medium text-sm">{item.name}</span>
      </div>
      {item.count && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
          }`}
        >
          {item.count}
        </span>
      )}
    </button>
  );
}

// Restaurant Status Component
function RestaurantStatus({ restaurant, onToggleStatus }) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggleStatus();
    } finally {
      setIsToggling(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 bg-gray-300 rounded mb-1"></div>
        <div className="h-3 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const StatusIcon = restaurant.isOpen ? Power : PowerOff;

  return (
    <div
      className={`rounded-lg p-4 text-white transition-all duration-300 ${
        restaurant.isOpen
          ? "bg-gradient-to-r from-green-400 to-blue-500"
          : "bg-gradient-to-r from-gray-400 to-gray-600"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Restaurant Status</span>
        <div
          className={`w-2 h-2 rounded-full ${
            restaurant.isOpen ? "bg-white animate-pulse" : "bg-white/50"
          }`}
        ></div>
      </div>
      <div className="flex items-center space-x-2 mb-2">
        <StatusIcon size={20} />
        <p className="text-lg font-bold">
          {restaurant.isOpen ? "Open" : "Closed"}
        </p>
      </div>
      <p className="text-xs opacity-90 mb-3">
        {restaurant.isOpen ? "Ready to receive orders" : "Not accepting orders"}
      </p>

      {/* Verification Status */}
      <div
        className={`flex items-center space-x-2 text-xs mb-3 p-2 rounded ${
          restaurant.isVerified ? "bg-white/20" : "bg-yellow-500/20"
        }`}
      >
        {restaurant.isVerified ? (
          <CheckCircle size={14} />
        ) : (
          <AlertCircle size={14} />
        )}
        <span>
          {restaurant.isVerified ? "Verified" : "Pending Verification"}
        </span>
      </div>

      <button
        onClick={handleToggle}
        disabled={isToggling}
        className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {isToggling ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <span>
            {restaurant.isOpen ? "Close Restaurant" : "Open Restaurant"}
          </span>
        )}
      </button>
    </div>
  );
}

// Restaurant Info Card Component - Updated for actual API structure
function RestaurantInfoCard({ restaurant }) {
  if (!restaurant) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Format currency for EUR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
          <p className="text-gray-600 text-sm mt-1 flex items-center space-x-2">
            <UtensilsCrossed size={14} />
            <span>{restaurant.cuisineType}</span>
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="text-yellow-400 fill-current" size={16} />
          <span className="font-medium text-gray-900">
            {parseFloat(restaurant.rating).toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">
            ({restaurant.reviewCount})
          </span>
        </div>
      </div>

      {restaurant.description && (
        <p className="text-gray-700 mb-4">{restaurant.description}</p>
      )}

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(restaurant.deliveryFee)}
          </p>
          <p className="text-xs text-gray-500">Delivery Fee</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(restaurant.minimumOrder)}
          </p>
          <p className="text-xs text-gray-500">Minimum Order</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            {restaurant.averageDeliveryTime} min
          </p>
          <p className="text-xs text-gray-500">Prep Time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <MapPin size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-500 mb-1">Address</p>
              <p className="text-gray-900">
                {restaurant.address}
                <br />
                {restaurant.city}, {restaurant.postalCode}
                <br />
                {restaurant.country}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Phone size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-gray-500 mb-1">Contact</p>
              {restaurant.phone && (
                <p className="text-gray-900">{restaurant.phone}</p>
              )}
              {restaurant.email && (
                <div className="flex items-center space-x-1 mt-1">
                  <Mail size={14} className="text-gray-500" />
                  <p className="text-gray-900">{restaurant.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {restaurant.tags && restaurant.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {restaurant.businessLicense && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Business License</p>
          <p className="text-gray-900 text-sm font-mono">
            {restaurant.businessLicense}
          </p>
        </div>
      )}
    </div>
  );
}

// Operating Hours Component - Updated for actual API structure
function OperatingHours({ openingHours }) {
  if (!openingHours) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Convert HHMM number to readable time string
  const formatTime = (timeNumber) => {
    if (!timeNumber) return "";
    const hours = Math.floor(timeNumber / 100);
    const minutes = timeNumber % 100;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Map numeric day indices to day names
  const getDayName = (index) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[parseInt(index)];
  };

  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock size={20} className="text-gray-700" />
        <h3 className="text-lg font-bold text-gray-900">Opening Hours</h3>
      </div>
      <div className="space-y-2">
        {Object.entries(openingHours).map(([dayIndex, hours]) => {
          const isToday = parseInt(dayIndex) === today;
          return (
            <div
              key={dayIndex}
              className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                isToday ? "bg-blue-50 border border-blue-200" : ""
              }`}
            >
              <span
                className={`font-medium ${
                  isToday ? "text-blue-900" : "text-gray-700"
                }`}
              >
                {getDayName(dayIndex)}
              </span>
              <span
                className={`text-sm ${
                  isToday
                    ? "text-blue-700 font-medium"
                    : hours.isClosed
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {hours.isClosed
                  ? "Closed"
                  : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mobile Menu Toggle
function MobileMenuToggle({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}

// Main Dashboard Layout Component
function DashboardLayoutContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Restaurant data state
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Onboarding check state
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasRestaurant, setHasRestaurant] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      message: "New order #1234 received",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "delivery",
      message: "Order #1230 out for delivery",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      type: "system",
      message: 'Menu item "Margherita Pizza" low stock',
      time: "1 hour ago",
      unread: false,
    },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  // Check if restaurant owner has completed onboarding
  useEffect(() => {
    const checkRestaurantOnboarding = async () => {
      if (user?.userType !== "restaurant_owner") {
        setIsCheckingOnboarding(false);
        return;
      }

      try {
        console.log("Checking restaurant onboarding status...");
        // Updated to use getOwnerRestaurant which matches your API response
        const response = await restaurantAPI.getOwnerRestaurant();
        console.log("Restaurant data response:", response);

        if (response.success && response.restaurant) {
          setHasRestaurant(true);
          setRestaurant(response.restaurant);
        } else {
          setHasRestaurant(false);
          console.log("No restaurant found, redirecting to onboarding...");



          return;
        }
      } catch (error) {
        console.error("Error checking restaurant onboarding:", error);

        // If we get a 404 or similar error, it likely means no restaurant exists
        if (
          error.response?.status === 404 ||
          error.message?.includes("not found") ||
          error.message?.includes("No restaurant")
        ) {
          setHasRestaurant(false);
          console.log("Restaurant not found, redirecting to onboarding...");
          router.push("/onboarding/restaurant");
          return;
        }

        // For other errors, show error message
        if (error.message && error.message.includes("Unexpected token")) {
          setError("Authentication failed. Please log in again.");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError("Failed to load restaurant data. Please try again.");
        }
      } finally {
        setIsCheckingOnboarding(false);
        setLoading(false);
      }
    };

    if (user?.userType === "restaurant_owner") {
      checkRestaurantOnboarding();
    } else {
      setIsCheckingOnboarding(false);
      setLoading(false);
    }
  }, [user, router]);

  // Toggle restaurant status
  const handleToggleRestaurantStatus = async () => {
    try {
      // This would be your API call to toggle restaurant status
      // const response = await restaurantAPI.toggleStatus();

      // For now, we'll just toggle locally
      setRestaurant((prev) => ({
        ...prev,
        isOpen: !prev.isOpen,
      }));

      console.log("Restaurant status toggled");
    } catch (error) {
      console.error("Error toggling restaurant status:", error);
    }
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const isActiveRoute = (href) => {
    if (href === "/restaurant") {
      return pathname === "/restaurant";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Show loading spinner while checking onboarding or loading restaurant data
  if (isCheckingOnboarding || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin text-yellow-500 mx-auto mb-4"
          />
          <p className="text-gray-600">
            {isCheckingOnboarding
              ? "Checking restaurant setup..."
              : "Loading restaurant data..."}
          </p>
        </div>
      </div>
    );
  }

  console.log(
    "Restaurant data loaded:",
    isCheckingOnboarding,
    hasRestaurant,
    hasRestaurant ? restaurant.name : "No restaurant"
  );
  // If user is restaurant owner but no restaurant found, they should be redirected
  // This is a fallback in case the redirect in useEffect doesn't work
  if (
    user?.userType === "restaurant_owner" &&
    !hasRestaurant &&
    !isCheckingOnboarding
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            
            Redirecting to restaurant setup...
          </p>
          <Loader2 size={32} className="animate-spin text-yellow-500 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      <MobileMenuToggle
        isOpen={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex gap-4 lg:gap-8">
          {/* Sidebar Navigation */}
          <div
            className={`w-64 flex-shrink-0 transition-all duration-300 ${
              mobileMenuOpen
                ? "fixed inset-y-0 left-0 z-40 bg-white shadow-xl"
                : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4 lg:top-24 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
              {/* Mobile header */}
              {mobileMenuOpen && (
                <div className="lg:hidden mb-4 pb-4 border-b border-gray-200">
                  <h2 className="font-bold text-gray-900">
                    Restaurant Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">{user?.firstName}</p>
                </div>
              )}

              <nav className="space-y-2">
                {NAVIGATION_ITEMS.map((item) => (
                  <NavigationItem
                    key={item.id}
                    item={item}
                    isActive={isActiveRoute(item.href)}
                    onClick={() => router.push(item.href)}
                  />
                ))}
              </nav>

              {/* Restaurant Status */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <RestaurantStatus
                  restaurant={restaurant}
                  onToggleStatus={handleToggleRestaurantStatus}
                />
              </div>

              {/* User Info (Mobile) */}
              {mobileMenuOpen && (
                <div className="mt-6 pt-6 border-t border-gray-200 lg:hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <PowerOff size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Overlay for mobile menu */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-red-800 font-medium">{error}</div>
              </div>
            )}

            {/* Restaurant Info Section - Only show on overview page */}
            {pathname === "/restaurant" && (
              <div className="mb-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <RestaurantInfoCard restaurant={restaurant} />
                  </div>
                  <div>
                    <OperatingHours openingHours={restaurant?.openingHours} />
                  </div>
                </div>
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
}

export default function ProtectedDashboardLayout({ children }) {
  return (
    <ProtectedRoute allowedUserTypes={["restaurant_owner"]}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
