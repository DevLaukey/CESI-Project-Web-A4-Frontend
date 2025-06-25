import {
  Bell,
  Circle,
  DollarSign,
  Settings,
  Truck,
  UtensilsCrossed,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function NotificationBell({ userType, notificationCount = 0 }) {
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
