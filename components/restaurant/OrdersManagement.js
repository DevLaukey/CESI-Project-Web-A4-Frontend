// components/restaurant/OrdersManagement.js
"use client";
import { useState, useEffect } from "react";

export default function OrdersManagement() {
  const [orders, setOrders] = useState([
    {
      id: "1234",
      customer: "John Smith",
      items: 3,
      total: 34.5,
      status: "preparing",
      time: "10:30 AM",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, City",
    },
    {
      id: "1235",
      customer: "Sarah Johnson",
      items: 2,
      total: 22.0,
      status: "ready",
      time: "10:25 AM",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Ave, City",
    },
    {
      id: "1236",
      customer: "Mike Wilson",
      items: 4,
      total: 48.75,
      status: "pending",
      time: "10:15 AM",
      phone: "+1 (555) 456-7890",
      address: "789 Pine St, City",
    },
    {
      id: "1237",
      customer: "Emma Davis",
      items: 1,
      total: 15.99,
      status: "pending",
      time: "10:05 AM",
      phone: "+1 (555) 321-0987",
      address: "321 Elm St, City",
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  };

  const getOrderStats = () => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  };

  const stats = getOrderStats();

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
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Refresh Orders
          </button>
        </div>
      </div>

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
          <div className="text-sm text-gray-600">Preparing</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
          <div className="text-sm text-gray-600">Ready for Pickup</div>
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
                  </div>
                  <div className="text-sm text-gray-600">{order.time}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customer}
                    </p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{order.items} items</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${order.total}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.status === "pending" && (
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
                      onClick={() => handleStatusChange(order.id, "ready")}
                      className="bg-green-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}

                  {order.status === "ready" && (
                    <button
                      onClick={() => handleStatusChange(order.id, "delivered")}
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

          {getFilteredOrders().length === 0 && (
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Phone
                </label>
                <p className="text-gray-900">{selectedOrder.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Address
                </label>
                <p className="text-gray-900">{selectedOrder.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Order Details
                </label>
                <p className="text-gray-900">
                  {selectedOrder.items} items • ${selectedOrder.total}
                </p>
              </div>
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
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Call Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
