"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  MapPin,
  Clock,
  Package,
  DollarSign,
  Navigation,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  X,
  Star,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("available");
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - in real app, this would come from API
  const [availableDeliveries, setAvailableDeliveries] = useState([
    {
      id: 1,
      restaurant: "Pizza Palace",
      customer: "John D.",
      address: "123 Main St, Downtown",
      distance: "2.3 km",
      earnings: "€8.50",
      estimatedTime: "25 min",
      items: 3,
      priority: "normal",
    },
    {
      id: 2,
      restaurant: "Burger King",
      customer: "Sarah M.",
      address: "456 Oak Ave, Uptown",
      distance: "1.8 km",
      earnings: "€12.00",
      estimatedTime: "20 min",
      items: 2,
      priority: "urgent",
    },
    {
      id: 3,
      restaurant: "Sushi Express",
      customer: "Mike R.",
      address: "789 Pine St, Midtown",
      distance: "3.1 km",
      earnings: "€15.50",
      estimatedTime: "35 min",
      items: 4,
      priority: "normal",
    },
  ]);

  const [deliveryHistory, setDeliveryHistory] = useState([
    {
      id: 101,
      date: "2024-06-13",
      restaurant: "Pizza Palace",
      customer: "Alice K.",
      earnings: "€9.00",
      rating: 5,
      status: "completed",
    },
    {
      id: 102,
      date: "2024-06-12",
      restaurant: "Taco Bell",
      customer: "Bob L.",
      earnings: "€7.50",
      rating: 4,
      status: "completed",
    },
  ]);

  const driverStats = {
    todayEarnings: "€45.50",
    weeklyEarnings: "€234.80",
    completedDeliveries: 23,
    averageRating: 4.8,
    onlineTime: "6h 30m",
  };

  useEffect(() => {
    // Simulate receiving notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotification = {
          id: Date.now(),
          type: "new_delivery",
          message: "New delivery request available nearby",
          time: new Date().toLocaleTimeString(),
        };
        setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptDelivery = (delivery) => {
    setCurrentDelivery(delivery);
    setAvailableDeliveries((prev) => prev.filter((d) => d.id !== delivery.id));
    setActiveTab("current");
  };

  const handleRejectDelivery = (deliveryId) => {
    setAvailableDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
  };

  const handleCompleteDelivery = () => {
    if (currentDelivery) {
      const completedDelivery = {
        ...currentDelivery,
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        status: "completed",
      };
      setDeliveryHistory((prev) => [completedDelivery, ...prev]);
      setCurrentDelivery(null);
      setActiveTab("available");
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const DeliveryCard = ({ delivery, showActions = true }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-800">
              {delivery.restaurant}
            </h3>
            {delivery.priority === "urgent" && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Urgent
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">Customer: {delivery.customer}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            {delivery.earnings}
          </div>
          <div className="text-sm text-gray-500">{delivery.estimatedTime}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {delivery.distance}
        </div>
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4" />
          {delivery.items} items
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-700">{delivery.address}</span>
      </div>

      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAcceptDelivery(delivery)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => handleRejectDelivery(delivery.id)}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Decline
          </button>
        </div>
      )}
    </div>
  );

  const CurrentDeliveryStatus = () => {
    const [deliveryStep, setDeliveryStep] = useState(0);
    const steps = [
      { title: "Heading to Restaurant", icon: Navigation },
      { title: "Picking up Order", icon: Package },
      { title: "Delivering to Customer", icon: MapPin },
      { title: "Delivery Complete", icon: CheckCircle },
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Current Delivery</h3>

        {/* Progress Steps */}
        <div className="mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === deliveryStep;
            const isComplete = index < deliveryStep;

            return (
              <div key={index} className="flex items-center mb-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    isComplete
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`${
                    isActive ? "font-semibold text-blue-600" : "text-gray-600"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Delivery Details */}
        <DeliveryCard delivery={currentDelivery} showActions={false} />

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setDeliveryStep(Math.min(deliveryStep + 1, 3))}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={deliveryStep === 3}
          >
            Next Step
          </button>
          <button className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {deliveryStep === 3 && (
          <button
            onClick={handleCompleteDelivery}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors mt-2 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Delivery
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 ml-2">
                Driver Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Online Status Toggle */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    isOnline ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
                <button
                  onClick={toggleOnlineStatus}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isOnline ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOnline ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  Driver
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div
            className={`lg:col-span-1 ${
              sidebarOpen ? "block" : "hidden"
            } lg:block`}
          >
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Earnings</span>
                  <span className="font-semibold text-green-600">
                    {driverStats.todayEarnings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deliveries</span>
                  <span className="font-semibold">
                    {driverStats.completedDeliveries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">
                      {driverStats.averageRating}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Online Time</span>
                  <span className="font-semibold">
                    {driverStats.onlineTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Weekly Report
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Schedule
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Profile Settings
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab("available")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "available"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Available Deliveries
              </button>
              <button
                onClick={() => setActiveTab("current")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "current"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Current Delivery
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                History
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
              {activeTab === "available" && (
                <div>
                  {!isOnline ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-800">
                          You're offline. Turn on availability to see delivery
                          requests.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">
                          Available Deliveries
                        </h2>
                        <span className="text-sm text-gray-500">
                          {availableDeliveries.length} available
                        </span>
                      </div>
                      {availableDeliveries.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No deliveries available right now</p>
                          <p className="text-sm mt-2">
                            New requests will appear here automatically
                          </p>
                        </div>
                      ) : (
                        <div>
                          {availableDeliveries.map((delivery) => (
                            <DeliveryCard
                              key={delivery.id}
                              delivery={delivery}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "current" && (
                <div>
                  {currentDelivery ? (
                    <CurrentDeliveryStatus />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No active delivery</p>
                      <p className="text-sm mt-2">
                        Accept a delivery to track it here
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Delivery History
                  </h2>
                  {deliveryHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No delivery history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deliveryHistory.map((delivery) => (
                        <div
                          key={delivery.id}
                          className="bg-white rounded-lg shadow-md p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {delivery.restaurant}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Customer: {delivery.customer}
                              </p>
                              <p className="text-xs text-gray-500">
                                {delivery.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {delivery.earnings}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {delivery.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}