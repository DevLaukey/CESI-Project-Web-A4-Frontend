"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
} from "lucide-react";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Mock data - In real app, this would come from the order-microservice API
  const mockOrders = [
    {
      id: "ORD-2024-001",
      restaurantName: "Mario's Italian Kitchen",
      restaurantImage:
        "https://th.bing.com/th/id/OIP.Gsioxfk2Jmay5Zum1xjDtgHaE8?rs=1&pid=ImgDetMain",
      orderDate: "2024-06-25T18:30:00Z",
      status: "delivered",
      total: 28.5,
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 18.99 },
        { name: "Caesar Salad", quantity: 1, price: 7.99 },
        { name: "Coca Cola", quantity: 1, price: 1.52 },
      ],
      deliveryAddress: "123 Main St, New York, NY 10001",
      deliveryTime: "45 min",
      rating: 5,
      paymentMethod: "Credit Card",
      deliveryFee: 2.99,
      tax: 2.28,
      tip: 4.5,
    },
    {
      id: "ORD-2024-002",
      restaurantName: "Sushi Express",
      restaurantImage:
        "https://images.squarespace-cdn.com/content/v1/63ab1e2739f9fd6cb4d05e55/f5e0fc1d-d1a1-4dea-b0cd-c0e3b56783ca/Dining+Image+-1+.JPG",
      orderDate: "2024-06-23T20:15:00Z",
      status: "delivered",
      total: 42.75,
      items: [
        { name: "Salmon Roll", quantity: 2, price: 24.0 },
        { name: "Miso Soup", quantity: 1, price: 4.5 },
        { name: "Green Tea", quantity: 1, price: 2.99 },
      ],
      deliveryAddress: "456 Park Ave, New York, NY 10016",
      deliveryTime: "35 min",
      rating: 4,
      paymentMethod: "PayPal",
      deliveryFee: 3.99,
      tax: 3.42,
      tip: 6.0,
    },
    {
      id: "ORD-2024-003",
      restaurantName: "Burger Palace",
      restaurantImage:
        "https://th.bing.com/th/id/OIP.GQoOGHxnCFKRNb0AWrQmgwHaFY?w=800&h=582&rs=1&pid=ImgDetMain",
      orderDate: "2024-06-22T12:45:00Z",
      status: "cancelled",
      total: 0.0,
      items: [
        { name: "Double Cheeseburger", quantity: 1, price: 12.99 },
        { name: "French Fries", quantity: 1, price: 4.99 },
      ],
      deliveryAddress: "789 Broadway, New York, NY 10003",
      deliveryTime: null,
      rating: null,
      paymentMethod: "Credit Card",
      deliveryFee: 0,
      tax: 0,
      tip: 0,
    },
    {
      id: "ORD-2024-004",
      restaurantName: "Healthy Bowls Co.",
      restaurantImage:
        "https://th.bing.com/th/id/OIP.o0R21z0I7Xby7iO5afoW_wAAAA?w=474&h=300&rs=1&pid=ImgDetMain",
      orderDate: "2024-06-20T13:20:00Z",
      status: "delivered",
      total: 19.25,
      items: [
        { name: "Quinoa Buddha Bowl", quantity: 1, price: 14.99 },
        { name: "Fresh Orange Juice", quantity: 1, price: 3.99 },
      ],
      deliveryAddress: "321 5th Ave, New York, NY 10016",
      deliveryTime: "30 min",
      rating: 5,
      paymentMethod: "Apple Pay",
      deliveryFee: 1.99,
      tax: 1.52,
      tip: 3.0,
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      setLoading(true);
      // In real app: const response = await fetch('/api/orders/history');
      setTimeout(() => {
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
      }, 1000);
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.restaurantName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "week":
            return (now - orderDate) / (1000 * 60 * 60 * 24) <= 7;
          case "month":
            return (now - orderDate) / (1000 * 60 * 60 * 24) <= 30;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.orderDate) - new Date(a.orderDate);
        case "oldest":
          return new Date(a.orderDate) - new Date(b.orderDate);
        case "highest":
          return b.total - a.total;
        case "lowest":
          return a.total - b.total;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy]);

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "in_progress":
        return "text-blue-600 bg-blue-50";
      case "preparing":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReorder = (order) => {
    // In real app, this would add items to cart and redirect to checkout
    alert(`Reordering from ${order.restaurantName}...`);
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="mt-2 text-gray-600">
            Track and manage all your previous orders
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders or restaurants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="in_progress">In Progress</option>
              <option value="preparing">Preparing</option>
            </select>

            {/* Date Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>

            {/* Sort */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Clock className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't placed any orders yet"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={order.restaurantImage}
                        alt={order.restaurantName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.restaurantName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(order.orderDate)}
                          {order.deliveryTime && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Delivered in {order.deliveryTime}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {order.deliveryAddress}
                        </div>
                        {order.rating && renderStars(order.rating)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${order.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Order #{order.id}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                      {expandedOrders.has(order.id) ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                    {order.status === "delivered" && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reorder
                      </button>
                    )}
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrders.has(order.id) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Order Items
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center py-2"
                              >
                                <div>
                                  <span className="text-gray-900">
                                    {item.name}
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    x{item.quantity}
                                  </span>
                                </div>
                                <span className="text-gray-900 font-medium">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Order Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="text-gray-900">
                                $
                                {(
                                  order.total -
                                  order.deliveryFee -
                                  order.tax -
                                  order.tip
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Delivery Fee
                              </span>
                              <span className="text-gray-900">
                                ${order.deliveryFee.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax</span>
                              <span className="text-gray-900">
                                ${order.tax.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tip</span>
                              <span className="text-gray-900">
                                ${order.tip.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                              <span className="text-gray-900">Total</span>
                              <span className="text-gray-900">
                                ${order.total.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-gray-600">
                                Payment Method
                              </span>
                              <span className="text-gray-900">
                                {order.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
