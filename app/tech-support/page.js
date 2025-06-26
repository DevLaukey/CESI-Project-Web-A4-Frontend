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
  Table,
  FileText,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Eye,
  Edit,
  MonitorSpeaker,
} from "lucide-react";

const TechnicalAssistanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedDatabase, setSelectedDatabase] = useState("all");

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

  const [databases, setDatabases] = useState([
    {
      id: 1,
      name: "user-management-db",
      type: "MySQL",
      status: "healthy",
      connections: 45,
      maxConnections: 100,
      size: "2.3 GB",
      queries: 1250,
      avgResponseTime: 12,
      uptime: "99.9%",
      host: "mysql-user-01.aiven.io",
      port: 3306,
      lastBackup: "2024-06-26 02:00:00",
    },
    {
      id: 2,
      name: "restaurant-db",
      type: "MySQL",
      status: "healthy",
      connections: 32,
      maxConnections: 100,
      size: "1.8 GB",
      queries: 890,
      avgResponseTime: 8,
      uptime: "99.8%",
      host: "mysql-restaurant-01.aiven.io",
      port: 3306,
      lastBackup: "2024-06-26 02:15:00",
    },
    {
      id: 3,
      name: "order-db",
      type: "MySQL",
      status: "warning",
      connections: 78,
      maxConnections: 100,
      size: "5.2 GB",
      queries: 2340,
      avgResponseTime: 45,
      uptime: "98.9%",
      host: "mysql-order-01.aiven.io",
      port: 3306,
      lastBackup: "2024-06-26 02:30:00",
    },
    {
      id: 4,
      name: "payment-db",
      type: "MySQL",
      status: "healthy",
      connections: 23,
      maxConnections: 100,
      size: "3.1 GB",
      queries: 567,
      avgResponseTime: 6,
      uptime: "99.9%",
      host: "mysql-payment-01.aiven.io",
      port: 3306,
      lastBackup: "2024-06-26 02:45:00",
    },
    {
      id: 5,
      name: "delivery-db",
      type: "MySQL",
      status: "healthy",
      connections: 56,
      maxConnections: 100,
      size: "1.5 GB",
      queries: 1120,
      avgResponseTime: 15,
      uptime: "99.7%",
      host: "mysql-delivery-01.aiven.io",
      port: 3306,
      lastBackup: "2024-06-26 03:00:00",
    },
    {
      id: 6,
      name: "notification-db",
      type: "MySQL",
      status: "healthy",
      connections: 19,
      maxConnections: 100,
      size: "0.8 GB",
      queries: 345,
      avgResponseTime: 10,
      uptime: "99.9%",
      host: "mysql-notification-01.aiven.io",
      port: 3306,
      lastBackup: "2024-06-26 03:15:00",
    },
    {
      id: 7,
      name: "referral-db",
      type: "MySQL",
      status: "healthy",
      connections: 12,
      maxConnections: 100,
      size: "0.4 GB",
      queries: 123,
      avgResponseTime: 7,
      uptime: "99.8%",
      host: "mysql-referral-01.aiven.io",
      port: 3306,
      lastBackup: "2024-06-26 03:30:00",
    },
  ]);

  const [slowQueries, setSlowQueries] = useState([
    {
      id: 1,
      database: "order-db",
      query:
        "SELECT * FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.created_at > '2024-06-01'",
      duration: 2.45,
      timestamp: "2024-06-26 14:30:25",
      rows_examined: 125000,
      rows_sent: 890,
      status: "completed",
    },
    {
      id: 2,
      database: "user-management-db",
      query:
        "SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.last_login < '2024-05-01'",
      duration: 1.82,
      timestamp: "2024-06-26 14:28:12",
      rows_examined: 89000,
      rows_sent: 234,
      status: "completed",
    },
    {
      id: 3,
      database: "restaurant-db",
      query:
        "UPDATE restaurants SET rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = restaurants.id)",
      duration: 3.21,
      timestamp: "2024-06-26 14:25:03",
      rows_examined: 45000,
      rows_sent: 0,
      status: "completed",
    },
  ]);

  const [dbConnections, setDbConnections] = useState([
    {
      id: 1,
      database: "order-db",
      host: "10.0.1.45",
      user: "order_service",
      state: "Sleep",
      time: 120,
      info: "SELECT COUNT(*) FROM orders WHERE status = 'pending'",
    },
    {
      id: 2,
      database: "user-management-db",
      host: "10.0.1.32",
      user: "auth_service",
      state: "Query",
      time: 5,
      info: "SELECT * FROM users WHERE email = ?",
    },
    {
      id: 3,
      database: "payment-db",
      host: "10.0.1.67",
      user: "payment_service",
      state: "Sleep",
      time: 45,
      info: "INSERT INTO transactions (order_id, amount, status) VALUES (?, ?, ?)",
    },
  ]);

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
      timestamp: "2024-06-26 14:30:25",
      ip: "192.168.1.100",
      user: "admin@foodapp.com",
      action: "Login",
      status: "success",
    },
    {
      timestamp: "2024-06-26 14:28:12",
      ip: "10.0.0.45",
      user: "dev@company.com",
      action: "API Access",
      status: "success",
    },
    {
      timestamp: "2024-06-26 14:25:03",
      ip: "172.16.0.23",
      user: "restaurant@pizza.com",
      action: "Login",
      status: "failed",
    },
    {
      timestamp: "2024-06-26 14:22:18",
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
              : Math.random() > 0.5
              ? "Database connection spike"
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
      completed: "bg-green-100 text-green-800",
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

  // Database functions
  const handleBackupDatabase = (dbId) => {
    console.log(`Backing up database ${dbId}...`);
  };

  const handleRestartDatabase = (dbId) => {
    console.log(`Restarting database ${dbId}...`);
  };

  const handleKillConnection = (connectionId) => {
    console.log(`Killing connection ${connectionId}...`);
    setDbConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
  };

  const handleOptimizeQuery = (queryId) => {
    console.log(`Optimizing query ${queryId}...`);
  };

  // Function to add a new component
  const handleAddComponent = () => {
    const newComponent = {
      id: Date.now(),
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

      {/* Database Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Database Health Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {databases.filter((db) => db.status === "healthy").length}
            </div>
            <div className="text-sm text-green-700">Healthy Databases</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {databases.filter((db) => db.status === "warning").length}
            </div>
            <div className="text-sm text-yellow-700">Warning Status</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {databases.reduce((sum, db) => sum + db.connections, 0)}
            </div>
            <div className="text-sm text-blue-700">Total Connections</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {databases.reduce((sum, db) => sum + db.queries, 0)}
            </div>
            <div className="text-sm text-purple-700">Queries/min</div>
          </div>
        </div>
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

  const renderDatabase = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Database Management
        </h2>
        <div className="flex space-x-3">
          <select
            value={selectedDatabase}
            onChange={(e) => setSelectedDatabase(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Databases</option>
            {databases.map((db) => (
              <option key={db.id} value={db.name}>
                {db.name}
              </option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Database Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {databases.map((db) => (
          <div
            key={db.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{db.name}</h3>
                  <p className="text-sm text-gray-500">{db.type}</p>
                </div>
              </div>
              <StatusBadge status={db.status} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connections</span>
                <span className="text-sm font-medium">
                  {db.connections}/{db.maxConnections}
                </span>
              </div>
              <ProgressBar
                value={db.connections}
                max={db.maxConnections}
                color={
                  db.connections > 80
                    ? "red"
                    : db.connections > 60
                    ? "yellow"
                    : "green"
                }
              />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium ml-1">{db.size}</span>
                </div>
                <div>
                  <span className="text-gray-600">Queries/min:</span>
                  <span className="font-medium ml-1">{db.queries}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium ml-1">
                    {db.avgResponseTime}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium ml-1">{db.uptime}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-2">
                <div>
                  Host: {db.host}:{db.port}
                </div>
                <div>Last Backup: {db.lastBackup}</div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleBackupDatabase(db.id)}
                  className="flex-1 bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200"
                >
                  Backup
                </button>
                <button
                  onClick={() => handleRestartDatabase(db.id)}
                  className="flex-1 bg-orange-100 text-orange-700 px-3 py-1 rounded text-xs hover:bg-orange-200"
                >
                  Restart
                </button>
                <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200">
                  Monitor
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slow Queries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Slow Query Log
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Database
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rows
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slowQueries.map((query) => (
                <tr key={query.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {query.database}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                    <div className="truncate font-mono text-xs bg-gray-100 p-2 rounded">
                      {query.query}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-medium text-red-600">
                      {query.duration}s
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.rows_examined.toLocaleString()} / {query.rows_sent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOptimizeQuery(query.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Connections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active Database Connections
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Database
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dbConnections.map((conn) => (
                <tr key={conn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {conn.database}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conn.host}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conn.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={conn.state.toLowerCase()} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conn.time}s
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="truncate font-mono text-xs">
                      {conn.info}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleKillConnection(conn.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Kill Connection"
                    >
                      <XCircle className="h-4 w-4" />
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
    { id: "database", label: "Database", icon: Database },
    { id: "components", label: "Components", icon: Table },
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

            {/* Notifications */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
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
          {activeTab === "database" && renderDatabase()}
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
