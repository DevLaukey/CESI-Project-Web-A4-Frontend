"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Key,
  Package,
  Download,
  Search,
  Code,
  Settings,
  Bell,
  Menu,
  X,
  Eye,
  Copy,
  Check,
  Plus,
  Star,
  Clock,
  Users,
  Activity,
} from "lucide-react";

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [apiKey, setApiKey] = useState("dev_sk_1234567890abcdef");
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data
  const [components] = useState([
    {
      id: 1,
      name: "Payment Gateway",
      description: "Secure payment processing for food orders",
      version: "2.1.0",
      downloads: 1250,
      rating: 4.8,
      category: "Payment",
      lastUpdated: "2 days ago",
      size: "2.3 MB",
    },
    {
      id: 2,
      name: "Real-time Tracking",
      description: "Live delivery tracking with GPS integration",
      version: "1.5.2",
      downloads: 890,
      rating: 4.6,
      category: "Tracking",
      lastUpdated: "1 week ago",
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Menu Builder",
      description: "Dynamic menu creation and management",
      version: "3.0.1",
      downloads: 2100,
      rating: 4.9,
      category: "UI Components",
      lastUpdated: "3 days ago",
      size: "3.1 MB",
    },
    {
      id: 4,
      name: "Notification System",
      description: "Push notifications for orders and updates",
      version: "1.2.4",
      downloads: 756,
      rating: 4.4,
      category: "Communication",
      lastUpdated: "5 days ago",
      size: "1.2 MB",
    },
  ]);

  const [profile, setProfile] = useState({
    name: "John Developer",
    email: "john@techcompany.com",
    company: "Tech Innovations Inc.",
    role: "Senior Developer",
    joined: "March 2024",
  });

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredComponents = components.filter(
    (component) =>
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "components", label: "Components", icon: Package },
    { id: "api-docs", label: "API Documentation", icon: Code },
    { id: "account", label: "Account", icon: User },
  ];

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Downloads</p>
              <p className="text-3xl font-bold">5,896</p>
            </div>
            <Download className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Projects</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <Code className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">API Calls Today</p>
              <p className="text-3xl font-bold">1,234</p>
            </div>
            <Activity className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Components Used</p>
              <p className="text-3xl font-bold">8</p>
            </div>
            <Package className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            API Key Management
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production API Key
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono text-gray-800">
                  {apiKey}
                </code>
                <button
                  onClick={copyApiKey}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Generate New Key
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              {
                action: "Downloaded Payment Gateway v2.1.0",
                time: "2 hours ago",
              },
              { action: "API key regenerated", time: "1 day ago" },
              { action: "Updated Menu Builder to v3.0.1", time: "3 days ago" },
              { action: "New project created", time: "1 week ago" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ComponentsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">
          Available Components
        </h2>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComponents.map((component) => (
          <div
            key={component.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {component.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {component.description}
                  </p>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {component.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    {component.downloads.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {component.rating}
                  </span>
                </div>
                <span className="text-xs">v{component.version}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {component.lastUpdated}
                </span>
                <span>{component.size}</span>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApiDocsContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          API Documentation
        </h2>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Getting Started
            </h3>
            <p className="text-gray-600 mb-4">
              Welcome to the Food Delivery Platform API. This RESTful API allows
              you to integrate our services into your applications seamlessly.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Base URL</h4>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                https://api.fooddelivery.platform/v1
              </code>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Authentication
            </h3>
            <p className="text-gray-600 mb-4">
              All API requests require authentication using your API key in the
              header.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800">
                {`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}
              </pre>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Endpoints
            </h3>
            <div className="space-y-4">
              {[
                {
                  method: "GET",
                  endpoint: "/restaurants",
                  description: "Retrieve all restaurants",
                },
                {
                  method: "POST",
                  endpoint: "/orders",
                  description: "Create a new order",
                },
                {
                  method: "GET",
                  endpoint: "/orders/{id}",
                  description: "Get order details",
                },
                {
                  method: "PUT",
                  endpoint: "/orders/{id}/status",
                  description: "Update order status",
                },
                {
                  method: "GET",
                  endpoint: "/tracking/{orderId}",
                  description: "Track delivery status",
                },
              ].map((endpoint, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        endpoint.method === "GET"
                          ? "bg-green-100 text-green-800"
                          : endpoint.method === "POST"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono">
                      {endpoint.endpoint}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600">
                    {endpoint.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AccountContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Account Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) =>
                  setProfile({ ...profile, company: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) =>
                  setProfile({ ...profile, role: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <p className="text-sm text-gray-500">
                Member since {profile.joined}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Usage Statistics
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>API Calls This Month</span>
                  <span className="font-medium">45,230</span>
                </div>
                <div className="flex justify-between">
                  <span>Components Downloaded</span>
                  <span className="font-medium">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Integrations</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
          <button className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "components":
        return <ComponentsContent />;
      case "api-docs":
        return <ApiDocsContent />;
      case "account":
        return <AccountContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Developer Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </button>
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </header> */}

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 lg:mt-8">
            <div className="px-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-4 sm:p-6 lg:p-8">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
