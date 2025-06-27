"use client";
import { useState, useEffect } from "react";
import { restaurantAPI } from "@/libs/api"; 

export default function DeliveryTracking() {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    averageTime: 0,
    onTimeRate: 0,
    customerSatisfaction: 0,
    activeDrivers: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper functions
  const mapOrderStatusToDeliveryStatus = (status) => {
    const statusMap = {
      pending: "waiting_driver",
      confirmed: "waiting_driver",
      preparing: "waiting_driver",
      ready: "waiting_driver",
      picked_up: "en_route",
      out_for_delivery: "en_route",
      delivered: "delivered",
      cancelled: "cancelled",
    };
    return statusMap[status] || "waiting_driver";
  };

  const calculateEstimatedTime = (delivery) => {
    if (delivery.status === "delivered") return "Delivered";
    if (delivery.estimatedDelivery) {
      const estimatedTime = new Date(delivery.estimatedDelivery);
      const now = new Date();
      const diffMinutes = Math.max(
        0,
        Math.floor((estimatedTime - now) / 60000)
      );
      return diffMinutes > 0 ? `${diffMinutes} min` : "Soon";
    }
    return "Pending";
  };

  const formatTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting_driver":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "en_route":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "waiting_driver":
        return "Waiting for Driver";
      case "en_route":
        return "En Route";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // Fetch deliveries data
  const fetchDeliveries = async () => {
    try {
      const response = await restaurantAPI.getDeliveries();
      const deliveries = response.data || response || [];

      // Transform and process the data
      const transformedDeliveries = deliveries.map((delivery) => {
        const transformed = restaurantAPI.transformDeliveryData([delivery])[0];
        return {
          ...transformed,
          status: mapOrderStatusToDeliveryStatus(transformed.status),
          estimatedTime: calculateEstimatedTime(transformed),
          pickupTime: formatTime(transformed.pickupTime),
          estimatedDelivery: formatTime(transformed.estimatedDelivery),
          deliveredTime: transformed.deliveredTime
            ? formatTime(transformed.deliveredTime)
            : null,
        };
      });

      setActiveDeliveries(transformedDeliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      setError(error.message);
    }
  };

  // Fetch delivery statistics
  const fetchDeliveryStats = async () => {
    try {
      const response = await restaurantAPI.getDeliveryStats();
      const transformedStats = restaurantAPI.transformStatsData(response);
      setDeliveryStats(transformedStats);
    } catch (error) {
      console.error("Error fetching delivery stats:", error);
      // Use fallback stats if API fails
      setDeliveryStats({
        totalDeliveries: 0,
        averageTime: 0,
        onTimeRate: 0,
        customerSatisfaction: 0,
        activeDrivers: 0,
        completedToday: 0,
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDeliveries(), fetchDeliveryStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      await restaurantAPI.updateDeliveryStatus(deliveryId, newStatus);

      // Update local state
      setActiveDeliveries((prev) =>
        prev.map((delivery) =>
          delivery.id === deliveryId
            ? {
                ...delivery,
                status: newStatus,
                deliveredTime:
                  newStatus === "delivered"
                    ? new Date().toLocaleTimeString()
                    : delivery.deliveredTime,
              }
            : delivery
        )
      );
    } catch (error) {
      console.error("Error updating delivery status:", error);
      setError("Failed to update delivery status");
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchDeliveries(), fetchDeliveryStats()]);
      } catch (error) {
        console.log("Failed to load delivery data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Delivery Tracking
          </h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading deliveries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Delivery Tracking
          </h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">
            Error loading delivery data
          </div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {deliveryStats.totalDeliveries}
          </div>
          <div className="text-sm text-gray-600">Total Deliveries</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {deliveryStats.averageTime} min
          </div>
          <div className="text-sm text-gray-600">Avg Delivery Time</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {deliveryStats.onTimeRate}%
          </div>
          <div className="text-sm text-gray-600">On-Time Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {deliveryStats.customerSatisfaction}
          </div>
          <div className="text-sm text-gray-600">Customer Rating</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {deliveryStats.activeDrivers}
          </div>
          <div className="text-sm text-gray-600">Active Drivers</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-teal-600">
            {deliveryStats.completedToday}
          </div>
          <div className="text-sm text-gray-600">Completed Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Deliveries */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Active Deliveries
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-900">
                          #{delivery.orderId}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            delivery.status
                          )}`}
                        >
                          {getStatusLabel(delivery.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {delivery.estimatedTime}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {delivery.customer}
                        </p>
                        <p className="text-sm text-gray-600">
                          {delivery.customerPhone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {delivery.address}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          €{delivery.orderTotal}
                        </p>
                      </div>

                      <div>
                        {delivery.driver ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              Driver: {delivery.driver.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {delivery.driver.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              {delivery.driver.vehicle}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-sm text-gray-600 ml-1">
                                {delivery.driver.rating}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              No driver assigned
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Items:</strong> {delivery.items.join(", ")}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Pickup: {delivery.pickupTime}</span>
                      {delivery.estimatedDelivery && (
                        <span>Est. Delivery: {delivery.estimatedDelivery}</span>
                      )}
                      {delivery.deliveredTime && (
                        <span className="text-green-600">
                          Delivered: {delivery.deliveredTime}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {delivery.status === "en_route" && (
                        <button
                          onClick={() =>
                            updateDeliveryStatus(delivery.id, "delivered")
                          }
                          className="bg-green-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}

                      <button className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                        Track Location
                      </button>

                      <button className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                        Call Customer
                      </button>

                      {delivery.driver && (
                        <button className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                          Call Driver
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {activeDeliveries.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🚚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No active deliveries
                    </h3>
                    <p className="text-gray-600">
                      All orders have been delivered successfully!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}