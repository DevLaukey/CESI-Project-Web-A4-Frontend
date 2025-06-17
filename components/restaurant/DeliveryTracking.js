// components/restaurant/DeliveryTracking.js
"use client";
import { useState, useEffect } from "react";

export default function DeliveryTracking() {
  const [activeDeliveries, setActiveDeliveries] = useState([
    {
      id: "1235",
      orderId: "1235",
      customer: "John Doe",
      customerPhone: "+1 (555) 123-4567",
      address: "123 Main St, Downtown",
      driver: {
        name: "Alex Johnson",
        phone: "+1 (555) 987-6543",
        rating: 4.8,
        vehicle: "Honda Civic - ABC123",
      },
      status: "en_route",
      estimatedTime: "15 min",
      orderTotal: 34.5,
      items: ["2x Margherita Pizza", "1x Caesar Salad"],
      pickupTime: "2:30 PM",
      estimatedDelivery: "2:45 PM",
    },
    {
      id: "1234",
      orderId: "1234",
      customer: "Sarah Smith",
      customerPhone: "+1 (555) 456-7890",
      address: "456 Oak Ave, Uptown",
      driver: {
        name: "Mike Wilson",
        phone: "+1 (555) 321-0987",
        rating: 4.9,
        vehicle: "Toyota Camry - XYZ789",
      },
      status: "delivered",
      estimatedTime: "Delivered",
      orderTotal: 22.0,
      items: ["1x Chicken Wings", "1x Soda"],
      pickupTime: "2:00 PM",
      deliveredTime: "2:18 PM",
    },
    {
      id: "1233",
      orderId: "1233",
      customer: "Emma Davis",
      customerPhone: "+1 (555) 654-3210",
      address: "789 Pine St, Westside",
      driver: null,
      status: "waiting_driver",
      estimatedTime: "Pending",
      orderTotal: 28.75,
      items: ["1x Pasta Carbonara", "1x Garlic Bread"],
      readyTime: "2:35 PM",
    },
  ]);

  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 42,
    averageTime: 28,
    onTimeRate: 94,
    customerSatisfaction: 4.8,
    activeDrivers: 6,
    completedToday: 38,
  });

  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      status: "delivering",
      rating: 4.8,
      deliveries: 8,
    },
    {
      id: 2,
      name: "Mike Wilson",
      status: "available",
      rating: 4.9,
      deliveries: 12,
    },
    {
      id: 3,
      name: "Sarah Brown",
      status: "delivering",
      rating: 4.7,
      deliveries: 6,
    },
    {
      id: 4,
      name: "Tom Garcia",
      status: "offline",
      rating: 4.6,
      deliveries: 9,
    },
  ]);

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

  const getDriverStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "delivering":
        return "bg-blue-100 text-blue-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const assignDriver = (deliveryId, driverId) => {
    const driver = drivers.find((d) => d.id === driverId);
    setActiveDeliveries((prev) =>
      prev.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, driver: driver, status: "en_route" }
          : delivery
      )
    );

    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, status: "delivering" } : d))
    );
  };

  const updateDeliveryStatus = (deliveryId, newStatus) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Tracking</h2>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Refresh Status
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Call Drivers
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
        <div className="xl:col-span-2">
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
                          ${delivery.orderTotal}
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
                            <select
                              onChange={(e) =>
                                e.target.value &&
                                assignDriver(
                                  delivery.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Assign Driver</option>
                              {drivers
                                .filter((d) => d.status === "available")
                                .map((driver) => (
                                  <option key={driver.id} value={driver.id}>
                                    {driver.name}
                                  </option>
                                ))}
                            </select>
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
                      {delivery.status === "waiting_driver" && (
                        <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Find Driver
                        </button>
                      )}

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

        {/* Driver Status */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Driver Status
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <p className="text-sm text-gray-600">
                        {driver.deliveries} deliveries today
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {driver.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDriverStatusColor(
                          driver.status
                        )}`}
                      >
                        {driver.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Performance */}
          <div className="bg-white rounded-lg border border-gray-200 mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Today's Performance
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Delivery Time</span>
                  <span className="font-medium">
                    {deliveryStats.averageTime} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">On-Time Delivery Rate</span>
                  <span className="font-medium text-green-600">
                    {deliveryStats.onTimeRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-medium text-green-600">
                    {deliveryStats.customerSatisfaction}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Distance Covered</span>
                  <span className="font-medium">127 miles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
