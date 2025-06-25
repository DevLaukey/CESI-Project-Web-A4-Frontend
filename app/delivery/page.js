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
  Settings,
  LogOut,
  Activity,
  Award,
  Timer,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import DriverMap to avoid SSR issues
const DriverMap = dynamic(() => import("@/components/delivery/DriverMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
      <div className="animate-pulse text-gray-600 font-medium">
        Loading map...
      </div>
    </div>
  ),
});

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("available");
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

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
      lat: 49.4154,
      lng: 1.098,
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
      lat: 49.4134,
      lng: 1.096,
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
      lat: 49.4164,
      lng: 1.095,
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

  // Get the driver's current location using the Geolocation API
  useEffect(() => {
    // Set default location first to avoid hydration issues
    setDriverLocation({ lat: 49.4144, lng: 1.097 });

    if (typeof window !== "undefined" && navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation({ lat: latitude, lng: longitude });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting initial location:", error);
          setLocationError(
            "Unable to get your location. Using default location."
          );
        }
      );

      // Watch position changes
      const locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation({ lat: latitude, lng: longitude });
          setLocationError(null);
        },
        (error) => {
          console.error("Error watching location:", error);
          setLocationError("Location tracking unavailable.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(locationWatcher);
      };
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 mb-4 border border-gray-100 hover:border-blue-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-800 text-lg">
              {delivery.restaurant}
            </h3>
            {delivery.priority === "urgent" && (
              <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                🔥 Urgent
              </span>
            )}
          </div>
          <p className="text-gray-600 flex items-center gap-2">
            <User className="w-4 h-4" />
            {delivery.customer}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {delivery.earnings}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {delivery.estimatedTime}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{delivery.distance}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-green-600" />
          <span className="font-medium">{delivery.items} items</span>
        </div>
      </div>

      <div className="flex items-start gap-2 mb-4">
        <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
        <span className="text-sm text-gray-700 leading-relaxed">
          {delivery.address}
        </span>
      </div>

      {showActions && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAcceptDelivery(delivery)}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
          >
            <CheckCircle className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => handleRejectDelivery(delivery.id)}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
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
      { title: "Heading to Restaurant", icon: Navigation, color: "blue" },
      { title: "Picking up Order", icon: Package, color: "orange" },
      { title: "Delivering to Customer", icon: MapPin, color: "purple" },
      { title: "Delivery Complete", icon: CheckCircle, color: "green" },
    ];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Current Delivery
        </h3>

        {/* Progress Steps */}
        <div className="mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === deliveryStep;
            const isComplete = index < deliveryStep;

            return (
              <div key={index} className="flex items-center mb-4 last:mb-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-all duration-300 ${
                    isComplete
                      ? "bg-green-500 text-white shadow-lg"
                      : isActive
                      ? "bg-blue-500 text-white shadow-lg animate-pulse"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span
                    className={`text-lg transition-all duration-300 ${
                      isActive
                        ? "font-semibold text-blue-600"
                        : isComplete
                        ? "font-medium text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </span>
                  {isActive && (
                    <p className="text-sm text-blue-500 mt-1">In progress...</p>
                  )}
                  {isComplete && (
                    <p className="text-sm text-green-500 mt-1">✓ Completed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Details */}
        <DeliveryCard delivery={currentDelivery} showActions={false} />

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setDeliveryStep(Math.min(deliveryStep + 1, 3))}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={deliveryStep === 3}
          >
            {deliveryStep === 3 ? "Completed" : "Next Step"}
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {deliveryStep === 3 && (
          <button
            onClick={handleCompleteDelivery}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-4 rounded-lg transition-all duration-200 mt-4 flex items-center justify-center gap-2 font-medium text-lg shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Delivery
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Driver Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Online Status Toggle */}
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

            {/* Notifications */}
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Driver Dashboard
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Manage your deliveries and track earnings
            </p>
          </div>

          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            {/* Online Status Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Status:</span>
              <button
                onClick={toggleOnlineStatus}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  isOnline ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isOnline ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-semibold ${
                  isOnline ? "text-green-600" : "text-gray-500"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* Settings */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Location Error Alert */}
        {locationError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <span className="text-yellow-800 font-medium">
                {locationError}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div
            className={`lg:col-span-1 ${
              sidebarOpen ? "block" : "hidden"
            } lg:block`}
          >
            {/* Today's Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Today's Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Earnings
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    {driverStats.todayEarnings}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Deliveries
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    {driverStats.completedDeliveries}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Rating
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-bold text-yellow-600">
                      {driverStats.averageRating}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-purple-600" />
                    Online Time
                  </span>
                  <span className="font-bold text-purple-600">
                    {driverStats.onlineTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg p-6 mb-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Weekly Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-100">Total Earnings</span>
                  <span className="font-bold text-xl">
                    {driverStats.weeklyEarnings}
                  </span>
                </div>
                <div className="w-full bg-blue-400/30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
                <p className="text-blue-100 text-sm">
                  65% of weekly goal achieved
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                  <TrendingUp className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Weekly Report</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                  <Calendar className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Schedule</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                  <User className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Profile Settings</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-3 group text-red-600">
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Map Component */}
            <DriverMap
              driverLocation={driverLocation}
              deliveries={availableDeliveries}
              currentDelivery={currentDelivery}
            />

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl mb-6 shadow-lg border border-gray-100">
              <button
                onClick={() => setActiveTab("available")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "available"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Available Deliveries
                {availableDeliveries.length > 0 && (
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeTab === "available" ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    {availableDeliveries.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("current")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "current"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Current Delivery
                {currentDelivery && (
                  <span
                    className={`ml-2 w-2 h-2 rounded-full ${
                      activeTab === "current" ? "bg-blue-300" : "bg-orange-400"
                    } animate-pulse`}
                  ></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === "history"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-6">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                        <div>
                          <h3 className="font-semibold text-yellow-800">
                            You're offline
                          </h3>
                          <p className="text-yellow-700 mt-1">
                            Turn on availability to see delivery requests.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          Available Deliveries
                        </h2>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {availableDeliveries.length} available
                        </span>
                      </div>
                      {availableDeliveries.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium text-gray-700 mb-2">
                            No deliveries available
                          </h3>
                          <p className="text-gray-500">
                            New requests will appear here automatically
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
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
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                      <Navigation className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No active delivery
                      </h3>
                      <p className="text-gray-500">
                        Accept a delivery to track it here
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Delivery History
                    </h2>
                  </div>
                  {deliveryHistory.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No delivery history yet
                      </h3>
                      <p className="text-gray-500">
                        Completed deliveries will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deliveryHistory.map((delivery) => (
                        <div
                          key={delivery.id}
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg mb-1">
                                {delivery.restaurant}
                              </h3>
                              <p className="text-gray-600 flex items-center gap-2 mb-2">
                                <User className="w-4 h-4" />
                                {delivery.customer}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {delivery.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600 mb-2">
                                {delivery.earnings}
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < delivery.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-2">
                                  {delivery.rating}/5
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
