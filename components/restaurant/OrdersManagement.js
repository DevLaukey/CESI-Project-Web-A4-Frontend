// components/restaurant/OrdersManagement.js
"use client";
import { OrderAPI, restaurantAPI } from "@/libs/api";
import { useState, useEffect, useCallback } from "react";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Function to get restaurant ID
  const getRestaurantId = useCallback(async () => {
    try {
      const response = await restaurantAPI.getRestaurantInfoFromUUID();
      const id = response.restaurant?.uuid;
      console.log("Restaurant ID:", id);
      return id;
    } catch (err) {
      console.error("Error fetching restaurant ID:", err);
      setError("Failed to fetch restaurant ID");
      return null;
    }
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);

        const restaurantId = await getRestaurantId();
        if (!restaurantId) return;

        const response = await OrderAPI.getSpecificRestaurantOrders(
          restaurantId
        );

        console.log("Fetched orders:", response);

        // Transform API response to match component structure
        const transformedOrders = Array.isArray(response)
          ? response.map((order) => {
              // Calculate total from items
              const total =
                order.items?.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                ) || 0;

              // Count total items
              const totalItems =
                order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return {
                id: order.id,
                uuid: order.uuid,
                customer: `Customer ${order.uuid?.slice(0, 8) || "Unknown"}`, // Fallback since no customer name in response
                items: totalItems,
                total: total,
                status: order.status || "pending",
                time: order.createdAt
                  ? new Date(order.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "",
                phone: "", // Not available in current response
                address: order.delivery_address || "",
                orderItems:
                  order.items?.map((item) => ({
                    item_id: item.item_id,
                    quantity: item.quantity,
                    price: item.price,
                    name: `Item ${item.item_id?.slice(0, 8)}`, // Fallback since no item name in response
                  })) || [],
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                payment_id: order.payment_id,
                restaurant_id: order.restaurant_id,
                specialInstructions: "", // Not available in current response
              };
            })
          : [];

        setOrders(transformedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getRestaurantId]
  );

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Use OrderAPI to update status - adjust this call based on your actual API method
      await OrderAPI.updateOrderStatus(orderId, newStatus);

      console.log(`Updating order ${orderId} status to ${newStatus}`);

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(`Failed to update order status: ${err.message}`);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  // Initial load and polling
  useEffect(() => {
    fetchOrders();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-green-100 text-green-800";
      case "picked_up":
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  };

  const getOrderStats = () => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter(
        (o) => o.status === "preparing" || o.status === "confirmed"
      ).length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  };

  const stats = getOrderStats();

  // Error state
  if (error && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <button
            onClick={() => fetchOrders()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading orders
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="confirmed">Confirmed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && orders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                There was an issue updating orders: {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">Pending Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {stats.preparing}
          </div>
          <div className="text-sm text-gray-600">Confirmed/Preparing</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {stats.delivered}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === "all"
              ? "All Orders"
              : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredOrders().map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-900">
                        #{order.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      {order.payment_id && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Paid
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{order.time}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customer}
                      </p>
                      <p className="text-sm text-gray-600">
                        UUID: {order.uuid?.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-600">{order.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.items} items
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                      {order.payment_id && (
                        <p className="text-xs text-green-600">
                          Payment ID: {order.payment_id.slice(0, 10)}...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === "confirmed" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, "preparing")
                          }
                          className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Accept & Prepare
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, "cancelled")
                          }
                          className="bg-red-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {order.status === "preparing" && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "out_for_delivery")
                        }
                        className="bg-green-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Out for Delivery
                      </button>
                    )}

                    {order.status === "out_for_delivery" && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "delivered")
                        }
                        className="bg-gray-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && getFilteredOrders().length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No orders found
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "No orders yet today."
                  : `No ${filter} orders found.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Order #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Customer
                </label>
                <p className="text-gray-900">{selectedOrder.customer}</p>
                <p className="text-xs text-gray-500">
                  Order UUID: {selectedOrder.uuid}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Delivery Address
                </label>
                <p className="text-gray-900">{selectedOrder.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Order Details
                </label>
                <p className="text-gray-900">
                  {selectedOrder.items} items • $
                  {selectedOrder.total.toFixed(2)}
                </p>
              </div>
              {selectedOrder.payment_id && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Payment ID
                  </label>
                  <p className="text-gray-900 text-xs font-mono">
                    {selectedOrder.payment_id}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              {selectedOrder.orderItems &&
                selectedOrder.orderItems.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Items
                    </label>
                    <div className="mt-2 space-y-1">
                      {selectedOrder.orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Order Times
                </label>
                <p className="text-xs text-gray-500">
                  Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
