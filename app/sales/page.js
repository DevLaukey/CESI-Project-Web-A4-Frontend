"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Eye,
  Pause,
  Edit,
  Trash2,
  Bell,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Truck,
  CreditCard,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  UserX,
} from "lucide-react";

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New order #1234 requires approval",
      type: "order",
      time: "2 min ago",
    },
    {
      id: 2,
      message: "Payment issue with order #1235",
      type: "payment",
      time: "5 min ago",
    },
    {
      id: 3,
      message: "Delivery driver John Doe reported late",
      type: "delivery",
      time: "10 min ago",
    },
  ]);

  // Mock data for customers
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john@email.com",
      status: "active",
      orders: 15,
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane@email.com",
      status: "suspended",
      orders: 8,
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@email.com",
      status: "active",
      orders: 23,
      joinDate: "2024-01-10",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@email.com",
      status: "active",
      orders: 12,
      joinDate: "2024-03-05",
    },
  ]);

  // Mock data for real-time dashboard
  const [dashboardData, setDashboardData] = useState({
    ordersPlaced: 145,
    ordersApproved: 128,
    deliveriesApproved: 115,
    deliveriesPaid: 98,
    globalTurnover: 15420.5,
    pendingOrders: 17,
    activeDeliveries: 23,
    totalRevenue: 45230.75,
  });

  // Mock order process data
  const [orderProcessData, setOrderProcessData] = useState([
    {
      id: 1,
      orderId: "#ORD-001",
      customer: "John Smith",
      restaurant: "Pizza Palace",
      status: "placed",
      amount: 25.99,
      time: "10:30 AM",
    },
    {
      id: 2,
      orderId: "#ORD-002",
      customer: "Jane Doe",
      restaurant: "Burger King",
      status: "approved",
      amount: 18.5,
      time: "10:25 AM",
    },
    {
      id: 3,
      orderId: "#ORD-003",
      customer: "Mike Johnson",
      restaurant: "Sushi Express",
      status: "delivery_approved",
      amount: 42.75,
      time: "10:20 AM",
    },
    {
      id: 4,
      orderId: "#ORD-004",
      customer: "Sarah Wilson",
      restaurant: "Taco Bell",
      status: "paid",
      amount: 15.25,
      time: "10:15 AM",
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "suspended":
        return "text-red-600 bg-red-100";
      case "placed":
        return "text-blue-600 bg-blue-100";
      case "approved":
        return "text-yellow-600 bg-yellow-100";
      case "delivery_approved":
        return "text-purple-600 bg-purple-100";
      case "paid":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleCustomerAction = (customerId, action) => {
    setCustomers(
      customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: action === "suspend" ? "suspended" : "active",
            }
          : customer
      )
    );
  };

  const handleDeleteCustomer = (customerId) => {
    setCustomers(customers.filter((customer) => customer.id !== customerId));
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData((prev) => ({
        ...prev,
        ordersPlaced: prev.ordersPlaced + Math.floor(Math.random() * 3),
        globalTurnover: prev.globalTurnover + Math.random() * 50,
        pendingOrders: Math.max(
          0,
          prev.pendingOrders + Math.floor(Math.random() * 5) - 2
        ),
        activeDeliveries: Math.max(
          0,
          prev.activeDeliveries + Math.floor(Math.random() * 3) - 1
        ),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`text-sm flex items-center mt-1 ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? "+" : ""}
              {change}%
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ShoppingCart}
          title="Orders Placed"
          value={dashboardData.ordersPlaced}
          change={5.2}
        />
        <StatCard
          icon={CheckCircle}
          title="Orders Approved"
          value={dashboardData.ordersApproved}
          change={3.1}
          color="green"
        />
        <StatCard
          icon={Truck}
          title="Deliveries Approved"
          value={dashboardData.deliveriesApproved}
          change={2.8}
          color="purple"
        />
        <StatCard
          icon={CreditCard}
          title="Deliveries Paid"
          value={dashboardData.deliveriesPaid}
          change={4.5}
          color="indigo"
        />
      </div>

      {/* Revenue and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Global Turnover
          </h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            ${dashboardData.globalTurnover.toFixed(2)}
          </div>
          <p className="text-sm text-gray-600">In progress transactions</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Orders</span>
              <span className="font-semibold text-yellow-600">
                {dashboardData.pendingOrders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Deliveries</span>
              <span className="font-semibold text-blue-600">
                {dashboardData.activeDeliveries}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue Today</span>
              <span className="font-semibold text-green-600">
                ${dashboardData.totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Process Monitoring */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Order Process Monitoring
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderProcessData.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.restaurant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomerManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Customer Management
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        customer.status
                      )}`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className={`${
                          customer.status === "active"
                            ? "text-yellow-600 hover:text-yellow-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        onClick={() =>
                          handleCustomerAction(
                            customer.id,
                            customer.status === "active"
                              ? "suspend"
                              : "activate"
                          )
                        }
                        title={
                          customer.status === "active" ? "Suspend" : "Activate"
                        }
                      >
                        {customer.status === "active" ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Notifications
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      notification.type === "order"
                        ? "bg-blue-100"
                        : notification.type === "payment"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    {notification.type === "order" && (
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                    )}
                    {notification.type === "payment" && (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    {notification.type === "delivery" && (
                      <Truck className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sales Department Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="relative p-2 text-gray-400 hover:text-gray-600"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notifications.length}
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">SA</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Sales Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "customers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Customer Management
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "notifications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Bell className="w-4 h-4 mr-2 inline" />
              Notifications
              {notifications.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "customers" && renderCustomerManagement()}
        {activeTab === "notifications" && renderNotifications()}
      </div>
    </div>
  );
};

export default SalesDashboard;
