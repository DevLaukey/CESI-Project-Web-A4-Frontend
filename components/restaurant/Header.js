"use client";
import React from 'react';
import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';

const Header = () => {
    function ProfileInfo({ user }) {
      const getInitials = (name) => {
        if (!name) return "RO";
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      };
    
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {getInitials(user?.firstName || user?.name)}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName || user?.name || "Restaurant Owner"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || "owner@restaurant.com"}
            </p>
          </div>
        </div>
      );
    }
    function NotificationBell({ notifications, onToggle, isOpen, onMarkRead }) {
      const unreadCount = notifications.filter((n) => n.unread).length;
    
      return (
        <div className="relative">
          <button
            onClick={onToggle}
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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
    
          {isOpen && (
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
                    onClick={() => onMarkRead(notification.id)}
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
      );
    }
    
    const { user, logout } = useAuth();

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

    const markNotificationRead = (id) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, unread: false } : notif
        )
      );
    };

    const handleLogout = () => {
      logout();
      router.push("/");
    };
  
    return (
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {user?.restaurantName || "Restaurant Dashboard"}
              </button>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Online
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell
                notifications={notifications}
                onToggle={() => setShowNotifications(!showNotifications)}
                isOpen={showNotifications}
                onMarkRead={markNotificationRead}
              />

              {/* Profile */}
              <div className="relative group">
                <ProfileInfo user={user} />

                {/* Profile Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => router.push("/restaurant/account")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Account Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Header;