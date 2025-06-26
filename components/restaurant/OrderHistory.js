// components/restaurant/OrderHistory.js
"use client";
import { OrderAPI, restaurantAPI } from "@/libs/api";
import { useState, useEffect, useCallback } from "react";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: "last_30_days",
    status: "all",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completionRate: 0,
  });

  // Function to get restaurant ID
  const getRestaurantId = useCallback(async () => {
    try {
      const response = await restaurantAPI.getRestaurantInfoFromUUID();
      const id = response.restaurant?.uuid;
      return id;
    } catch (err) {
      console.error("Error fetching restaurant ID:", err);
      setError("Failed to fetch restaurant ID");
      return null;
    }
  }, []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const restaurantId = await getRestaurantId();
      if (!restaurantId) return;

      const response = await OrderAPI.getSpecificRestaurantOrders(restaurantId);
      console.log("Fetched order history:", response);

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

            // Determine if order is considered completed
            const isCompleted = [
              "delivered",
              "picked_up",
              "completed",
            ].includes(order.status);
            const isCancelled = order.status === "cancelled";
            const isRefunded = order.status === "refunded";

            return {
              id: order.id,
              uuid: order.uuid,
              customer: `Customer ${order.uuid?.slice(0, 8) || "Unknown"}`,
              date: order.createdAt
                ? new Date(order.createdAt).toISOString().split("T")[0]
                : "",
              time: order.createdAt
                ? new Date(order.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "",
              items: totalItems,
              total: total.toFixed(2),
              status: isCompleted
                ? "completed"
                : isCancelled
                ? "cancelled"
                : isRefunded
                ? "refunded"
                : order.status,
              paymentMethod: order.payment_id ? "Card" : "Pending",
              deliveryMethod: "Delivery", // Default since we don't have this info
              rating: null, // Not available in current response
              notes: "",
              orderItems:
                order.items?.map((item) => ({
                  item_id: item.item_id,
                  quantity: item.quantity,
                  price: item.price,
                  name: `Item ${item.item_id?.slice(0, 8)}`,
                })) || [],
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              payment_id: order.payment_id,
              restaurant_id: order.restaurant_id,
              delivery_address: order.delivery_address,
            };
          })
        : [];

      // Sort by date (newest first)
      transformedOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(transformedOrders);
      calculateStats(transformedOrders);
    } catch (err) {
      console.error("Error fetching order history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getRestaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const calculateStats = (orderData) => {
    const totalOrders = orderData.length;
    const completedOrders = orderData.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );
    const avgOrderValue = totalRevenue / completedOrders.length || 0;
    const completionRate =
      totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

    setStats({
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      completionRate: completionRate.toFixed(1),
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Date range filter
    if (filters.dateRange !== "custom") {
      const today = new Date();
      let filterDate = new Date();

      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (order) => new Date(order.date) >= filterDate
          );
          break;
        case "last_7_days":
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(
            (order) => new Date(order.date) >= filterDate
          );
          break;
        case "last_30_days":
          filterDate.setDate(today.getDate() - 30);
          filtered = filtered.filter(
            (order) => new Date(order.date) >= filterDate
          );
          break;
        case "last_3_months":
          filterDate.setMonth(today.getMonth() - 3);
          filtered = filtered.filter(
            (order) => new Date(order.date) >= filterDate
          );
          break;
      }
    } else if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(
        (order) =>
          order.date >= filters.startDate && order.date <= filters.endDate
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.uuid.toLowerCase().includes(searchTerm) ||
          order.customer.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const exportToCSV = () => {
    const filteredOrders = getFilteredOrders();
    const headers = [
      "Order ID",
      "UUID",
      "Customer",
      "Date",
      "Items",
      "Total",
      "Status",
      "Payment",
      "Delivery Address",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          order.id,
          order.uuid,
          order.customer,
          order.date,
          order.items,
          order.total,
          order.status,
          order.paymentMethod,
          order.delivery_address,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order_history_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const filteredOrders = getFilteredOrders();
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading order history...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
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
                Error loading order history
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredOrders.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
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
                There was an issue loading some data: {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalOrders}
          </div>
          <div className="text-gray-600">Total Orders</div>
          <div className="text-sm text-blue-600 mt-1">All time</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-green-600">
            ${stats.totalRevenue}
          </div>
          <div className="text-gray-600">Total Revenue</div>
          <div className="text-sm text-green-600 mt-1">Completed orders</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">
            ${stats.avgOrderValue}
          </div>
          <div className="text-gray-600">Avg Order Value</div>
          <div className="text-sm text-purple-600 mt-1">
            Per completed order
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-orange-600">
            {stats.completionRate}%
          </div>
          <div className="text-gray-600">Completion Rate</div>
          <div className="text-sm text-orange-600 mt-1">Success rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_3_months">Last 3 months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.dateRange === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="ready">Ready</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Order ID, UUID, or customer"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <button
            onClick={() => {
              setFilters({
                dateRange: "last_30_days",
                status: "all",
                search: "",
                startDate: "",
                endDate: "",
              });
              setCurrentPage(1);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Order History ({filteredOrders.length} orders)
            </h3>
            <div className="text-sm text-gray-600">
              Showing {currentOrders.length} of {filteredOrders.length} orders
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Order ID
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Items
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Total
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Payment
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Address
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div>{order.customer}</div>
                    <div className="text-xs text-gray-500">
                      {order.uuid?.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div>{order.date}</div>
                    <div className="text-xs text-gray-500">{order.time}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {order.items} items
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    ${order.total}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div>{order.paymentMethod}</div>
                    {order.payment_id && (
                      <div className="text-xs text-gray-500">
                        {order.payment_id.slice(0, 10)}...
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div className="max-w-32 truncate">
                      {order.delivery_address}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => {
                        // You can add a modal or navigate to order details
                        console.log("View order details:", order);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.search ||
            filters.status !== "all" ||
            filters.dateRange !== "last_30_days"
              ? "Try adjusting your filters to see more orders."
              : "No order history available yet."}
          </p>
          {(filters.search ||
            filters.status !== "all" ||
            filters.dateRange !== "last_30_days") && (
            <button
              onClick={() => {
                setFilters({
                  dateRange: "last_30_days",
                  status: "all",
                  search: "",
                  startDate: "",
                  endDate: "",
                });
                setCurrentPage(1);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
