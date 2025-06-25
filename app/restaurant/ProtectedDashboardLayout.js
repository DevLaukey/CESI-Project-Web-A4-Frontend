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
  Clock,
  Menu,
  X,
  Power,
  PowerOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bell,
  ChevronRight,
  Badge,
  Eye,
  EyeOff,
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

// Enhanced Navigation Item Component
function NavigationItem({ item, isActive, onClick }) {
  const IconComponent = item.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-[1.02]"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`p-1.5 rounded-lg ${
            isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
          }`}
        >
          <IconComponent
            size={18}
            className={isActive ? "text-white" : "text-gray-600"}
          />
        </div>
        <span className="font-medium text-sm">{item.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        {item.count && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
            }`}
          >
            {item.count}
          </span>
        )}
        <ChevronRight
          size={14}
          className={`transition-transform ${
            isActive
              ? "text-white/70"
              : "text-gray-400 group-hover:text-gray-600"
          }`}
        />
      </div>
    </button>
  );
}

// Enhanced Restaurant Status Component
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
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-300 rounded mb-3"></div>
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-8 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const StatusIcon = restaurant.isOpen ? Power : PowerOff;

  return (
    <div
      className={`rounded-xl p-4 text-white transition-all duration-300 shadow-lg ${
        restaurant.isOpen
          ? "bg-gradient-to-br from-green-400 via-green-500 to-emerald-600"
          : "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold opacity-90">
          Restaurant Status
        </span>
        <div
          className={`w-3 h-3 rounded-full ${
            restaurant.isOpen
              ? "bg-white animate-pulse shadow-lg"
              : "bg-white/50"
          }`}
        ></div>
      </div>

      <div className="flex items-center space-x-3 mb-3">
        <div
          className={`p-2 rounded-lg ${
            restaurant.isOpen ? "bg-white/20" : "bg-white/10"
          }`}
        >
          <StatusIcon size={20} />
        </div>
        <div>
          <p className="text-xl font-bold">
            {restaurant.isOpen ? "Open" : "Closed"}
          </p>
          <p className="text-xs opacity-80">
            {restaurant.isOpen
              ? "Ready to receive orders"
              : "Not accepting orders"}
          </p>
        </div>
      </div>

      {/* Verification Status */}
      <div
        className={`flex items-center space-x-2 text-xs mb-4 p-2.5 rounded-lg ${
          restaurant.isVerified ? "bg-white/15" : "bg-yellow-500/20"
        }`}
      >
        {restaurant.isVerified ? (
          <CheckCircle size={14} />
        ) : (
          <AlertCircle size={14} />
        )}
        <span className="font-medium">
          {restaurant.isVerified
            ? "Verified Restaurant"
            : "Pending Verification"}
        </span>
      </div>

      <button
        onClick={handleToggle}
        disabled={isToggling}
        className="w-full bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 hover:scale-[1.02] transform"
      >
        {isToggling ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            {restaurant.isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>
              {restaurant.isOpen ? "Close Restaurant" : "Open Restaurant"}
            </span>
          </>
        )}
      </button>
    </div>
  );
}

// Enhanced Restaurant Info Card Component
function RestaurantInfoCard({ restaurant }) {
  if (!restaurant) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-300 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {restaurant.name ? restaurant.name.charAt(0) : "R"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {restaurant.name}
            </h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <UtensilsCrossed size={14} />
              <span className="text-sm font-medium">
                {restaurant.cuisineType}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1.5 rounded-full">
          <Star className="text-yellow-500 fill-current" size={16} />
          <span className="font-bold text-gray-900">
            {parseFloat(restaurant.rating || 0).toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">
            ({restaurant.reviewCount || 0})
          </span>
        </div>
      </div>

      {/* Description */}
      {restaurant.description && (
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {restaurant.description}
          </p>
        </div>
      )}

      {/* Business Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-lg font-bold text-blue-900">
            {formatCurrency(restaurant.deliveryFee || 0)}
          </p>
          <p className="text-xs text-blue-600 font-medium">Delivery Fee</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <p className="text-lg font-bold text-green-900">
            {formatCurrency(restaurant.minimumOrder || 0)}
          </p>
          <p className="text-xs text-green-600 font-medium">Min Order</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <p className="text-lg font-bold text-purple-900">
            {restaurant.averageDeliveryTime || 30} min
          </p>
          <p className="text-xs text-purple-600 font-medium">Prep Time</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MapPin size={16} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
              <div className="text-sm text-gray-900 leading-relaxed">
                <p>{restaurant.address}</p>
                <p>
                  {restaurant.city}, {restaurant.postalCode}
                </p>
                <p className="text-gray-600">{restaurant.country}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {(restaurant.phone || restaurant.email) && (
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Contact
                </p>
                <div className="space-y-1">
                  {restaurant.phone && (
                    <p className="text-sm text-gray-900">{restaurant.phone}</p>
                  )}
                  {restaurant.email && (
                    <div className="flex items-center space-x-2">
                      <Mail size={12} className="text-gray-500" />
                      <p className="text-sm text-gray-900">
                        {restaurant.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {restaurant.tags && restaurant.tags.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Restaurant Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Business License */}
      {restaurant.businessLicense && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Badge size={16} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Business License
              </p>
              <p className="text-sm text-gray-900 font-mono mt-1">
                {restaurant.businessLicense}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Operating Hours Component
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
      className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
    >
      {isOpen ? (
        <X size={24} className="text-gray-700" />
      ) : (
        <Menu size={24} className="text-gray-700" />
      )}
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

  // Check if restaurant owner has completed onboarding
  useEffect(() => {
    const checkRestaurantOnboarding = async () => {
      if (user?.userType !== "restaurant_owner") {
        setIsCheckingOnboarding(false);
        return;
      }

      try {
        console.log("Checking restaurant onboarding status...");
        const response = await restaurantAPI.getOwnerRestaurant();
        console.log("Restaurant data response:", response);

        if (response.success && response.restaurant) {
          setHasRestaurant(true);
          setRestaurant(response.restaurant);
        } else {
          setHasRestaurant(false);
          console.log("No restaurant found, redirecting to onboarding...");
          router.push("/onboarding/restaurant");
          return;
        }
      } catch (error) {
        console.error("Error checking restaurant onboarding:", error);

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
      console.log("Toggling restaurant status...");
      console.log("Current restaurant status:", restaurant.isOpen);

      const response = await restaurantAPI.toggleRestaurantStatus(
        !restaurant.isOpen
      );
      console.log("Toggle status response:", response);

      if (!response.success) {
        throw new Error("Failed to toggle restaurant status");
      }

      setRestaurant((prev) => ({
        ...prev,
        isOpen: !prev.isOpen,
      }));

      console.log("Restaurant status toggled");
    } catch (error) {
      console.error("Error toggling restaurant status:", error);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <Loader2
            size={48}
            className="animate-spin text-blue-500 mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">
            {isCheckingOnboarding
              ? "Checking restaurant setup..."
              : "Loading restaurant data..."}
          </p>
          <div className="w-48 h-1 bg-gray-200 rounded-full mt-4 mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // If user is restaurant owner but no restaurant found, they should be redirected
  if (
    user?.userType === "restaurant_owner" &&
    !hasRestaurant &&
    !isCheckingOnboarding
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <p className="text-gray-600 mb-4 font-medium">
            Redirecting to restaurant setup...
          </p>
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Toggle */}
      <MobileMenuToggle
        isOpen={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div
            className={`w-72 flex-shrink-0 transition-all duration-300 ${
              mobileMenuOpen
                ? "fixed inset-y-0 left-0 z-40 bg-white shadow-2xl"
                : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4 lg:top-8 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
              {/* Mobile header */}
              {mobileMenuOpen && (
                <div className="lg:hidden mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.firstName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Dashboard</h2>
                      <p className="text-sm text-gray-600">{user?.firstName}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="space-y-2 mb-6">
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
              <div className="mb-6">
                <RestaurantStatus
                  restaurant={restaurant}
                  onToggleStatus={handleToggleRestaurantStatus}
                />
              </div>

              {/* User Actions */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <PowerOff size={16} />
                  </div>
                  <span className="font-medium text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Overlay for mobile menu */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <div className="text-red-800 font-medium">{error}</div>
                </div>
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
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </div>
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
