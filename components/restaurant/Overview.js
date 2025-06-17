// components/restaurant/Overview.js
"use client";
import { useState, useEffect } from 'react';

export default function Overview() {
  const [stats, setStats] = useState({
    todayOrders: 47,
    todayRevenue: 1247.50,
    avgOrderValue: 26.54,
    pendingOrders: 8,
    monthlyGrowth: 12.5,
    customerSatisfaction: 4.7
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: '1234', customer: 'John Smith', items: 3, total: 34.50, status: 'preparing', time: '10:30 AM' },
    { id: '1233', customer: 'Sarah Johnson', items: 2, total: 22.00, status: 'ready', time: '10:25 AM' },
    { id: '1232', customer: 'Mike Wilson', items: 4, total: 48.75, status: 'delivered', time: '10:15 AM' },
    { id: '1231', customer: 'Emma Davis', items: 1, total: 15.99, status: 'cancelled', time: '10:05 AM' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // API call simulation
  useEffect(() => {
    // TODO: Replace with actual API calls
    // fetchDashboardStats();
    // fetchRecentOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
            <span className="text-gray-600 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats.todayRevenue}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+8.2%</span>
            <span className="text-gray-600 ml-2">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">${stats.avgOrderValue}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+3.1%</span>
            <span className="text-gray-600 ml-2">vs last week</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <a 
              href="/restaurant/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.customer}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.items} items</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">${order.total}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}