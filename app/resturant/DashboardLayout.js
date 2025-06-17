"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

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

  const navigation = [
    {
      id: "overview",
      name: "Overview",
      icon: "📊",
      href: "restaurant",
      count: null,
    },
    {
      id: "orders",
      name: "Orders",
      icon: "📋",
      href: "orders",
      count: 8,
    },
    {
      id: "menu",
      name: "Menu Management",
      icon: "🍽️",
      href: "menu",
      count: null,
    },
    {
      id: "items",
      name: "Items",
      icon: "🍕",
      href: "items",
      count: null,
    },
    {
      id: "delivery",
      name: "Delivery Tracking",
      icon: "🚚",
      href: "delivery",
      count: 3,
    },
    {
      id: "history",
      name: "Order History",
      icon: "📈",
      href: "history",
      count: null,
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: "📊",
      href: "analytics",
      count: null,
    },
    {
      id: "referrals",
      name: "Referrals",
      icon: "👥",
      href: "referrals",
      count: null,
    },
    {
      id: "account",
      name: "Account Settings",
      icon: "⚙️",
      href: "account",
      count: null,
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Bella Vista Restaurant
              </button>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Online
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
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
                      d="M15 17h5l-5 5v-5zM3 12l9-9 9 9H3z"
                    />
                  </svg>
                  {notifications.filter((n) => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter((n) => n.unread).length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            notification.unread ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markNotificationRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">BV</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    Restaurant Owner
                  </p>
                  <p className="text-xs text-gray-500">owner@bellavista.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                      isActiveRoute(item.href)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {item.count && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isActiveRoute(item.href)
                            ? "bg-white/20 text-white"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push("/restaurant/items")}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    + Add New Item
                  </button>
                  <button
                    onClick={() => router.push("/restaurant/menu")}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    + Create Menu
                  </button>
                  <button
                    onClick={() => router.push("/restaurant/orders")}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    📋 View Orders
                  </button>
                </div>
              </div>

              {/* Status Card */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Restaurant Status
                    </span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-lg font-bold">Online</p>
                  <p className="text-xs opacity-90">Ready to receive orders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">{children}</div>
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
