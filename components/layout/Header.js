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

// Enhanced ProfileInfo component with user type-specific display
function ProfileInfo({ user, userType }) {
  const getInitials = (name) => {
    if (!name) {
      // Default initials based on user type
      switch (userType) {
        case "restaurant_owner":
          return "RO";
        case "delivery_driver":
          return "DD";
        case "end_user":
          return "EU";
        default:
          return "U";
      }
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name;

    // Fallback names based on user type
    switch (userType) {
      case "restaurant_owner":
        return "Restaurant Owner";
      case "delivery_driver":
        return "Delivery Driver";
      case "end_user":
        return "Customer";
      default:
        return "User";
    }
  };

  const getUserRole = () => {
    switch (userType) {
      case "restaurant_owner":
        return user?.restaurantName || "Restaurant Owner";
      case "delivery_driver":
        return user?.vehicleType
          ? `Driver (${user.vehicleType})`
          : "Delivery Driver";
      case "end_user":
        return user?.location || "Customer";
      default:
        return "User";
    }
  };

  const getAvatarColors = () => {
    switch (userType) {
      case "restaurant_owner":
        return "from-blue-500 to-purple-500";
      case "delivery_driver":
        return "from-green-500 to-teal-500";
      case "end_user":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-8 h-8 bg-gradient-to-r ${getAvatarColors()} rounded-full flex items-center justify-center`}
      >
        <span className="text-white text-sm font-medium">
          {getInitials(getDisplayName())}
        </span>
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
        <p className="text-xs text-gray-500">{getUserRole()}</p>
      </div>
    </div>
  );
}

// Enhanced AuthLinks with user type-specific dropdown menus
function AuthLinks({ isAuthenticated, user, userType, onLogout }) {
  const router = useRouter();

  const getStatusIndicator = () => {
    switch (userType) {
      case "restaurant_owner":
        return user?.restaurantStatus === "online" ? (
          <span className="text-green-600 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Restaurant Online
          </span>
        ) : (
          <span className="text-red-600 text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Restaurant Offline
          </span>
        );
      case "delivery_driver":
        return user?.driverStatus === "available" ? (
          <span className="text-green-600 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Available
          </span>
        ) : (
          <span className="text-orange-600 text-xs flex items-center gap-1">
            <Circle className="w-3 h-3" />
            Busy
          </span>
        );
      case "end_user":
        return user?.membershipLevel ? (
          <span className="text-purple-600 text-xs flex items-center gap-1">
            <Circle className="w-3 h-3 fill-purple-500" />
            {user.membershipLevel} Member
          </span>
        ) : null;
      default:
        return null;
    }
  };

  if (isAuthenticated) {
    const statusIndicator = getStatusIndicator();

    return (
      <>
        <div className="relative group">
          <div className="cursor-pointer">
            <ProfileInfo user={user} userType={userType} />
          </div>

          {/* Enhanced Profile Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center space-x-3 mb-2">
                <ProfileInfo user={user} userType={userType} />
              </div>
              {statusIndicator && <div className="mt-2">{statusIndicator}</div>}
              <p className="text-xs text-gray-600 mt-1">
                {user?.email || "No email provided"}
              </p>
            </div>

            {/* Quick Actions for Restaurant Owners */}
            {userType === "restaurant_owner" && (
              <div className="border-t border-gray-200 py-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Actions
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => router.push("/restaurant/items")}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Menu Item
                    </button>
                    <button
                      onClick={() => router.push("/restaurant/orders")}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <ClipboardList className="w-3 h-3" />
                      View New Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for Delivery Drivers */}
            {userType === "delivery_driver" && (
              <div className="border-t border-gray-200 py-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Actions
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        /* Toggle availability */
                      }}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Toggle Availability
                    </button>
                    <button
                      onClick={() => router.push("/delivery/deliveries")}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <Package className="w-3 h-3" />
                      View Active Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Link
        href={"/login"}
        className="text-gray-500 hover:text-gray-700 transition-colors text-sm sm:text-base"
      >
        Login
      </Link>
      <Link
        href={"/register?type=end_user"}
        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full px-4 sm:px-6 py-2 text-sm font-medium transition-colors inline-block shadow-sm"
      >
        Register
      </Link>
    </>
  );
}

function NotificationBell({ userType, notificationCount = 0 }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const mockNotifications = {
      restaurant_owner: [
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
          message: "Low stock: Margherita Pizza",
          time: "1 hour ago",
          unread: false,
        },
      ],
      delivery_driver: [
        {
          id: 1,
          type: "delivery",
          message: "New delivery assignment available",
          time: "5 min ago",
          unread: true,
        },
        {
          id: 2,
          type: "system",
          message: "You're now online and ready for orders",
          time: "30 min ago",
          unread: false,
        },
        {
          id: 3,
          type: "delivery",
          message: "Delivery completed successfully",
          time: "2 hours ago",
          unread: false,
        },
      ],
      end_user: [
        {
          id: 1,
          type: "order",
          message: "Your order is being prepared",
          time: "10 min ago",
          unread: true,
        },
        {
          id: 2,
          type: "promotion",
          message: "20% off your next order!",
          time: "1 hour ago",
          unread: true,
        },
        {
          id: 3,
          type: "system",
          message: "Order delivered successfully",
          time: "1 day ago",
          unread: false,
        },
      ],
    };

    setNotifications(mockNotifications[userType] || []);
  }, [userType]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <UtensilsCrossed className="w-4 h-4 text-orange-500" />;
      case "delivery":
        return <Truck className="w-4 h-4 text-green-500" />;
      case "promotion":
        return <DollarSign className="w-4 h-4 text-purple-500" />;
      case "system":
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  if (userType === "end_user") return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      notification.unread ? "bg-blue-50" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <Circle className="w-2 h-2 fill-blue-500 text-blue-500 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, unread: false }))
                    )
                  }
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, user, userType, userName, logout } = useAuth();
  const { cartProducts } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getBrandName = () => {
    switch (userType) {
      case "restaurant_owner":
        return "RestaurantHub";
      case "delivery_driver":
        return "DriveEats";
      default:
        return "ST PIZZA";
    }
  };

  const getNavLinks = () => {
    switch (userType) {
      case "restaurant_owner":
        return [
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
          { href: "/menu", label: "Menu" },
          { href: "/restaurants", label: "Restaurants" },
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
          {userType === "end_user" && (
            <Link
              href={"/cart"}
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
            {userType === "end_user" && (
              <Link
                href={"/cart"}
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
