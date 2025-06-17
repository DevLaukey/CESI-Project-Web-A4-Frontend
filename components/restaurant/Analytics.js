// components/restaurant/Analytics.js
"use client";
import { useState, useEffect } from "react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("this_month");
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 12847,
      previous: 11234,
      growth: 14.4,
      trend: "up",
    },
    orders: {
      current: 847,
      previous: 742,
      growth: 14.2,
      trend: "up",
    },
    customers: {
      current: 1247,
      previous: 1089,
      growth: 14.5,
      trend: "up",
    },
    avgOrderValue: {
      current: 26.54,
      previous: 24.12,
      growth: 10.0,
      trend: "up",
    },
  });

  const [topItems, setTopItems] = useState([
    { name: "Margherita Pizza", orders: 124, revenue: 2356.76, growth: 8.2 },
    { name: "Caesar Salad", orders: 89, revenue: 1112.5, growth: -2.1 },
    { name: "Chicken Wings", orders: 76, revenue: 1139.24, growth: 15.3 },
    { name: "Pasta Carbonara", orders: 54, revenue: 904.5, growth: 22.1 },
    { name: "Beef Burger", orders: 67, revenue: 1206.33, growth: 5.7 },
  ]);

  const [peakHours, setPeakHours] = useState([
    { hour: "12:00 PM", orders: 47, revenue: 1245.3 },
    { hour: "7:00 PM", orders: 39, revenue: 1089.45 },
    { hour: "6:00 PM", orders: 34, revenue: 892.1 },
    { hour: "1:00 PM", orders: 28, revenue: 743.2 },
    { hour: "8:00 PM", orders: 25, revenue: 678.9 },
  ]);

  const [customerMetrics, setCustomerMetrics] = useState({
    newCustomers: 186,
    returningCustomers: 432,
    customerRetention: 73.2,
    avgCustomerLifetime: 145.67,
    customerSatisfaction: 4.7,
  });

  const [salesData, setSalesData] = useState([
    { day: "Mon", orders: 45, revenue: 1234 },
    { day: "Tue", orders: 52, revenue: 1456 },
    { day: "Wed", orders: 38, revenue: 987 },
    { day: "Thu", orders: 61, revenue: 1632 },
    { day: "Fri", orders: 78, revenue: 2145 },
    { day: "Sat", orders: 89, revenue: 2467 },
    { day: "Sun", orders: 67, revenue: 1789 },
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value, isGrowth = false) => {
    const formatted = Math.abs(value).toFixed(1);
    if (isGrowth) {
      return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
    }
    return `${formatted}%`;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? "📈" : "📉";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics & Statistics
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="this_year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">💰</div>
            <span
              className={`text-sm font-medium ${getGrowthColor(
                analytics.revenue.growth
              )}`}
            >
              {getGrowthIcon(analytics.revenue.growth)}{" "}
              {formatPercentage(analytics.revenue.growth, true)}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.revenue.current)}
          </div>
          <div className="text-gray-600 text-sm">Total Revenue</div>
          <div className="text-xs text-gray-500 mt-1">
            vs {formatCurrency(analytics.revenue.previous)} last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📋</div>
            <span
              className={`text-sm font-medium ${getGrowthColor(
                analytics.orders.growth
              )}`}
            >
              {getGrowthIcon(analytics.orders.growth)}{" "}
              {formatPercentage(analytics.orders.growth, true)}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.orders.current.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm">Total Orders</div>
          <div className="text-xs text-gray-500 mt-1">
            vs {analytics.orders.previous.toLocaleString()} last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">👥</div>
            <span
              className={`text-sm font-medium ${getGrowthColor(
                analytics.customers.growth
              )}`}
            >
              {getGrowthIcon(analytics.customers.growth)}{" "}
              {formatPercentage(analytics.customers.growth, true)}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics.customers.current.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm">Total Customers</div>
          <div className="text-xs text-gray-500 mt-1">
            vs {analytics.customers.previous.toLocaleString()} last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📊</div>
            <span
              className={`text-sm font-medium ${getGrowthColor(
                analytics.avgOrderValue.growth
              )}`}
            >
              {getGrowthIcon(analytics.avgOrderValue.growth)}{" "}
              {formatPercentage(analytics.avgOrderValue.growth, true)}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.avgOrderValue.current)}
          </div>
          <div className="text-gray-600 text-sm">Avg Order Value</div>
          <div className="text-xs text-gray-500 mt-1">
            vs {formatCurrency(analytics.avgOrderValue.previous)} last period
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Sales Overview
            </h3>
            <p className="text-sm text-gray-600">Daily sales performance</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {salesData.map((day, index) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {day.day}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (day.orders /
                              Math.max(...salesData.map((d) => d.orders))) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {day.orders} orders
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Insights
            </h3>
            <p className="text-sm text-gray-600">
              Customer behavior and satisfaction
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {customerMetrics.newCustomers}
                  </div>
                  <div className="text-sm text-gray-600">New Customers</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {customerMetrics.returningCustomers}
                  </div>
                  <div className="text-sm text-gray-600">Returning</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Retention</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(customerMetrics.customerRetention)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Customer Lifetime</span>
                  <span className="font-medium">
                    {formatCurrency(customerMetrics.avgCustomerLifetime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="font-medium">
                      {customerMetrics.customerSatisfaction}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Selling Items
            </h3>
            <p className="text-sm text-gray-600">Best performing menu items</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.orders} orders
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.revenue)}
                    </div>
                    <div className={`text-sm ${getGrowthColor(item.growth)}`}>
                      {formatPercentage(item.growth, true)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
            <p className="text-sm text-gray-600">Busiest times of the day</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {peakHours.map((hour, index) => (
                <div
                  key={hour.hour}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-600"
                          : index === 1
                          ? "bg-gray-100 text-gray-600"
                          : index === 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {hour.hour}
                      </div>
                      <div className="text-sm text-gray-600">
                        {hour.orders} orders
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(hour.revenue)}
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (hour.orders /
                              Math.max(...peakHours.map((h) => h.orders))) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
          <p className="text-sm text-gray-600">AI-powered business insights</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-lg font-semibold mb-2">
                🎯 Revenue Growth
              </div>
              <p className="text-sm text-gray-700">
                Your revenue has grown by 14.4% this month. Weekend sales are
                particularly strong, contributing 35% of weekly revenue.
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-lg font-semibold mb-2">
                🍕 Menu Performance
              </div>
              <p className="text-sm text-gray-700">
                Pizza items account for 42% of total orders. Consider expanding
                the pizza menu or adding seasonal varieties.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 text-lg font-semibold mb-2">
                ⏰ Peak Times
              </div>
              <p className="text-sm text-gray-700">
                Lunch (12-1 PM) and dinner (7-8 PM) are your busiest hours.
                Consider staff optimization during these times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
