"use client";
import { CartContext } from "@/components/AppContext";
import Bars2 from "@/components/icons/Bars2";
import ShoppingCart from "@/components/icons/ShoppingCart";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function AuthLinks({ status, userName, userType }) {
  if (status === "authenticated") {
    const getDashboardLink = () => {
      switch (userType) {
        case "restaurant_owner":
          return "/dashboard";
        case "delivery_driver":
          return "/driver-dashboard";
        case "end_user":
        default:
          return "/profile";
      }
    };

    const getDashboardLabel = () => {
      switch (userType) {
        case "restaurant_owner":
          return "Dashboard";
        case "delivery_driver":
          return "Driver Dashboard";
        case "end_user":
        default:
          return "Profile";
      }
    };

    return (
      <>
        <Link
          href={getDashboardLink()}
          className="whitespace-nowrap text-gray-500 hover:text-gray-700 transition-colors"
        >
          Hello, {userName}
        </Link>
        {userType !== "end_user" && (
          <Link
            href={getDashboardLink()}
            className="hidden sm:inline-block bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
          >
            {getDashboardLabel()}
          </Link>
        )}
        <button
          onClick={() => signOut()}
          className="bg-white hover:bg-yellow-50 rounded-full border border-yellow-400 text-yellow-600 hover:text-yellow-700 px-4 sm:px-6 py-2 text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </>
    );
  }
  if (status === "unauthenticated") {
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
}

function LocationInput() {
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      try {
        const locationData = JSON.parse(storedLocation);
        setLocation(locationData.address);
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    }
  }, []);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      setIsSubmitting(true);
      const locationData = {
        address: location.trim(),
        timestamp: new Date().toISOString(),
        isDetected: false,
      };

      localStorage.setItem("userLocation", JSON.stringify(locationData));
      setShowLocationInput(false);
      setIsSubmitting(false);
      router.push("/restaurants");
    }
  };

  const getCurrentLocation = () => {
    setIsSubmitting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const simulatedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(
            4
          )} (Detected Location)`;

          const locationData = {
            address: simulatedAddress,
            coordinates: { latitude, longitude },
            timestamp: new Date().toISOString(),
            isDetected: true,
          };

          localStorage.setItem("userLocation", JSON.stringify(locationData));
          setLocation(simulatedAddress);
          setShowLocationInput(false);
          setIsSubmitting(false);
          router.push("/restaurants");
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsSubmitting(false);
        }
      );
    } else {
      setIsSubmitting(false);
    }
  };

  if (location && !showLocationInput) {
    return (
      <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-xs">
        <svg
          className="w-4 h-4 text-gray-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm text-gray-700 truncate flex-1">
          {location}
        </span>
        <button
          onClick={() => setShowLocationInput(true)}
          className="ml-2 text-yellow-600 hover:text-yellow-700 text-xs"
        >
          Change
        </button>
      </div>
    );
  }

  if (showLocationInput) {
    return (
      <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md">
        <form
          onSubmit={handleLocationSubmit}
          className="flex items-center flex-1"
        >
          <svg
            className="w-4 h-4 text-gray-400 ml-3 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter delivery address"
            className="flex-1 py-2 px-2 text-sm outline-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!location.trim() || isSubmitting}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Go"}
          </button>
        </form>
        <button
          onClick={() => setShowLocationInput(false)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowLocationInput(true)}
      className="hidden lg:flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-yellow-700 hover:bg-yellow-100 transition-colors"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span className="text-sm font-medium">Enter Location</span>
    </button>
  );
}

function NotificationBell({ userType, notificationCount = 0 }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock notifications based on user type
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
        return "🍕";
      case "delivery":
        return "🚚";
      case "promotion":
        return "🎉";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  if (userType === "end_user") return null; // No notifications for regular users in header

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4 19h9m-9-4h9m-9-4h9m-9-8h9"
          />
        </svg>
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
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="text-2xl mb-2">🔔</div>
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
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
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
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
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
  const session = useSession();
  const status = session?.status;
  const userData = session.data?.user;
  const userType = userData?.type || "end_user"; // Default to end_user if no type specified
  let userName = userData?.name || userData?.email;
  const { cartProducts } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (userName && userName.includes(" ")) {
    userName = userName.split(" ")[0];
  }

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
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/orders", label: "Orders" },
          { href: "/dashboard/menu", label: "Menu" },
        ];
      case "delivery_driver":
        return [
          { href: "/driver-dashboard", label: "Dashboard" },
          { href: "/driver-dashboard/deliveries", label: "Deliveries" },
          { href: "/driver-dashboard/earnings", label: "Earnings" },
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
          {/* Mobile Location for customers */}
          {userType === "end_user" && (
            <Link
              href="/restaurants"
              className="p-2 text-gray-500 hover:text-yellow-500 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          )}

          {/* Mobile Cart for customers */}
          {userType === "end_user" && (
            <Link
              href={"/cart"}
              className="relative p-2 hover:text-yellow-500 transition-colors"
            >
              <ShoppingCart />
              {cartProducts?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs py-1 px-2 rounded-full leading-3 min-w-[18px] text-center font-medium">
                  {cartProducts.length}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Notifications */}
          {status === "authenticated" && userType !== "end_user" && (
            <NotificationBell userType={userType} />
          )}

          <button
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-yellow-400 transition-colors"
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <Bars2 />
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
              status={status}
              userName={userName}
              userType={userType}
            />
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between">
        <nav className="flex items-center gap-6 text-gray-600 font-medium">
          <Link className="text-yellow-500 font-bold text-2xl mr-4" href={"/"}>
            {getBrandName()}
          </Link>
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
          {/* Location Input for customers */}
          {userType === "end_user" && <LocationInput />}

          <nav className="flex items-center gap-4 text-gray-600 font-medium">
            <AuthLinks
              status={status}
              userName={userName}
              userType={userType}
            />

            {/* Desktop Cart for customers */}
            {userType === "end_user" && (
              <Link
                href={"/cart"}
                className="relative p-2 hover:text-yellow-500 transition-colors"
              >
                <ShoppingCart />
                {cartProducts?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs py-1 px-2 rounded-full leading-3 min-w-[20px] text-center font-medium">
                    {cartProducts.length}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop Notifications */}
            {status === "authenticated" && userType !== "end_user" && (
              <NotificationBell userType={userType} />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
