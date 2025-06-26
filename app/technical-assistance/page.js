"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Activity,
  Download,
  Route,
  Cloud,
  Bell,
  Plus,
  Trash2,
  Search,
  Filter,
  BarChart3,
  Server,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Zap,
  Globe,
  Shield,
  RefreshCw,
} from "lucide-react";

const TechnicalAssistanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  // Mock data for demonstration
  const [components, setComponents] = useState([
    {
      id: 1,
      name: "User Authentication",
      version: "2.1.0",
      downloads: 1247,
      status: "active",
    },
    {
      id: 2,
      name: "Payment Gateway",
      version: "1.8.3",
      downloads: 892,
      status: "active",
    },
    {
      id: 3,
      name: "Order Tracking",
      version: "3.0.1",
      downloads: 2156,
      status: "active",
    },
    {
      id: 4,
      name: "Notification System",
      version: "1.5.2",
      downloads: 763,
      status: "maintenance",
    },
  ]);

  const [serverStats, setServerStats] = useState({
    totalServers: 12,
    activeServers: 11,
    cpuUsage: 67,
    memoryUsage: 54,
    diskUsage: 78,
    networkTraffic: 2.4,
  });

  const [microservices, setMicroservices] = useState([
    {
      name: "Auth Service",
      status: "healthy",
      cpu: 23,
      memory: 45,
      requests: 1250,
    },
    {
      name: "Order Service",
      status: "healthy",
      cpu: 67,
      memory: 72,
      requests: 2340,
    },
    {
      name: "Payment Service",
      status: "warning",
      cpu: 89,
      memory: 91,
      requests: 890,
    },
    {
      name: "Notification Service",
      status: "healthy",
      cpu: 34,
      memory: 28,
      requests: 567,
    },
    {
      name: "Delivery Service",
      status: "healthy",
      cpu: 45,
      memory: 38,
      requests: 1890,
    },
  ]);

  const [connectionLogs, setConnectionLogs] = useState([
    {
      timestamp: "2024-06-24 14:30:25",
      ip: "192.168.1.100",
      user: "admin@foodapp.com",
      action: "Login",
      status: "success",
    },
    {
      timestamp: "2024-06-24 14:28:12",
      ip: "10.0.0.45",
      user: "dev@company.com",
      action: "API Access",
      status: "success",
    },
    {
      timestamp: "2024-06-24 14:25:03",
      ip: "172.16.0.23",
      user: "restaurant@pizza.com",
      action: "Login",
      status: "failed",
    },
    {
      timestamp: "2024-06-24 14:22:18",
      ip: "192.168.1.200",
      user: "driver@delivery.com",
      action: "Login",
      status: "success",
    },
  ]);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification = {
          id: Date.now(),
          message: `System alert: ${
            Math.random() > 0.5
              ? "High CPU usage detected"
              : "New component deployed"
          }`,
          type: Math.random() > 0.5 ? "warning" : "info",
          timestamp: new Date().toLocaleTimeString(),
        };
        setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const StatusBadge = ({ status }) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      healthy: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      maintenance: "bg-blue-100 text-blue-800",
      error: "bg-red-100 text-red-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const MetricCard = ({
    title,
    value,
    unit,
    icon: Icon,
    trend,
    color = "blue",
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
            <span className="text-sm font-normal text-gray-500 ml-1">
              {unit}
            </span>
          </p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}% vs last hour
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ value, max = 100, color = "blue" }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  );

  // Function to add a new component
  const handleAddComponent = () => {
    const newComponent = {
      id: Date.now(), // Using Date.now() as a unique id
      name: "New Component",
      version: "1.0.0",
      downloads: 0,
      status: "active",
    };
    setComponents((prevComponents) => [...prevComponents, newComponent]);
  };

  // Function to delete a component
  const handleDeleteComponent = (id) => {
    setComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== id)
    );
  };

  // Function to deploy service
  const handleDeployService = () => {
    console.log("Deploying service...");
  };

  // Function to refresh routes
  const handleRefreshRoutes = () => {
    console.log("Refreshing routes...");
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Servers"
          value={serverStats.activeServers}
          unit={`/ ${serverStats.totalServers}`}
          icon={Server}
          trend={2}
          color="green"
        />
        <MetricCard
          title="CPU Usage"
          value={serverStats.cpuUsage}
          unit="%"
          icon={Cpu}
          trend={-5}
          color="blue"
        />
        <MetricCard
          title="Memory Usage"
          value={serverStats.memoryUsage}
          unit="%"
          icon={HardDrive}
          trend={3}
          color="purple"
        />
        <MetricCard
          title="Network Traffic"
          value={serverStats.networkTraffic}
          unit="GB/s"
          icon={Network}
          trend={8}
          color="indigo"
        />
      </div>

      {/* Microservices Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Microservices Status
        </h3>
        <div className="space-y-4">
          {microservices.map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <StatusBadge status={service.status} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-500">
                    {service.requests} requests/min
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">CPU</p>
                  <p className="text-sm font-medium">{service.cpu}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Memory</p>
                  <p className="text-sm font-medium">{service.memory}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComponents = () => (
    <div className="space-y-6">
      {/* Components Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Reusable Components
        </h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          onClick={handleAddComponent}
        >
          <Plus className="h-4 w-4" />
          <span>Add Component</span>
        </button>
      </div>

      {/* Components List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search components..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {components.map((component) => (
                <tr key={component.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {component.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {component.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {component.downloads.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={component.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-red-600 hover:text-red-900 mr-4"
                      onClick={() => handleDeleteComponent(component.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Settings className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Connection Logs</h2>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {connectionLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Route Orchestration
        </h2>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          onClick={handleRefreshRoutes}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Routes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Routes
          </h3>
          <div className="space-y-3">
            {[
              {
                path: "/api/v1/auth",
                method: "POST",
                status: "active",
                load: 23,
              },
              {
                path: "/api/v1/orders",
                method: "GET",
                status: "active",
                load: 67,
              },
              {
                path: "/api/v1/payments",
                method: "POST",
                status: "maintenance",
                load: 0,
              },
              {
                path: "/api/v1/notifications",
                method: "GET",
                status: "active",
                load: 12,
              },
            ].map((route, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      route.method === "GET"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {route.method}
                  </span>
                  <span className="font-mono text-sm">{route.path}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {route.load}% load
                  </span>
                  <StatusBadge status={route.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Load Distribution
          </h3>
          <div className="space-y-4">
            {[
              { server: "Server 1", load: 45, requests: 1250 },
              { server: "Server 2", load: 67, requests: 1890 },
              { server: "Server 3", load: 23, requests: 780 },
              { server: "Server 4", load: 89, requests: 2340 },
            ].map((server, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    {server.server}
                  </span>
                  <span className="text-sm text-gray-500">
                    {server.requests} req/min
                  </span>
                </div>
                <ProgressBar
                  value={server.load}
                  color={
                    server.load > 80
                      ? "red"
                      : server.load > 60
                      ? "yellow"
                      : "green"
                  }
                />
                <div className="text-xs text-gray-500">{server.load}% load</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeployment = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Service Deployment
        </h2>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          onClick={handleDeployService}
        >
          <Cloud className="h-4 w-4" />
          <span>Deploy Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Deployments
          </h3>
          <div className="space-y-4">
            {[
              {
                service: "Payment Service",
                version: "v2.1.0",
                status: "success",
                time: "2 hours ago",
              },
              {
                service: "Auth Service",
                version: "v1.8.5",
                status: "success",
                time: "6 hours ago",
              },
              {
                service: "Order Service",
                version: "v3.2.1",
                status: "failed",
                time: "1 day ago",
              },
              {
                service: "Notification Service",
                version: "v1.5.2",
                status: "success",
                time: "2 days ago",
              },
            ].map((deployment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      deployment.status === "success"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {deployment.service}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {deployment.version}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={deployment.status} />
                  <p className="text-xs text-gray-500 mt-1">
                    {deployment.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Deployment Stats
          </h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">24</div>
              <div className="text-sm text-green-700">
                Successful Deployments
              </div>
              <div className="text-xs text-green-600">This month</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-red-700">Failed Deployments</div>
              <div className="text-xs text-red-600">This month</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">98.7%</div>
              <div className="text-sm text-blue-700">Success Rate</div>
              <div className="text-xs text-blue-600">Overall</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "components", label: "Components", icon: Database },
    { id: "logs", label: "Connection Logs", icon: Shield },
    { id: "performance", label: "Performance", icon: BarChart3 },
    { id: "routes", label: "Routes", icon: Route },
    { id: "deployment", label: "Deployment", icon: Cloud },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Technical Assistance
                </h1>
                <p className="text-sm text-gray-500">
                  Platform monitoring and management
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {notifications.length > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`p-1 rounded-full ${
                                notification.type === "warning"
                                  ? "bg-yellow-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              {notification.type === "warning" ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <Bell className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {notification.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">TA</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "components" && renderComponents()}
          {activeTab === "logs" && renderLogs()}
          {activeTab === "performance" && renderOverview()}
          {activeTab === "routes" && renderRoutes()}
          {activeTab === "deployment" && renderDeployment()}
        </div>
      </div>
    </div>
  );
};

export default TechnicalAssistanceDashboard;
