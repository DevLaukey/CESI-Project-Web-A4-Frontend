"use client";
import React, { useState, useEffect } from "react";
import {
  BarChart3,
  ShoppingCart,
  CheckCircle,
  Truck,
  CreditCard,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { OrderAPI, userAPI, restaurantAPI2 } from "@/libs/api"; // adjust path if needed

export default function SalesDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    ordersPlaced: 0,
    ordersApproved: 0,
    deliveriesApproved: 0,
    deliveriesPaid: 0,
    globalTurnover: 0,
    pendingOrders: 0,
    activeDeliveries: 0,
    totalRevenueToday: 0,
  });

  // Helper for tailwind status color badges:
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-gray-600 bg-gray-100";
      case "confirmed": // was “approved”
        return "text-yellow-600 bg-yellow-100";
      case "preparing":
        return "text-indigo-600 bg-indigo-100";
      case "out_for_delivery": // was “delivery_approved”
        return "text-purple-600 bg-purple-100";
      case "delivered": // was “paid”
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const fetchOrdersAndCompute = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching orders...");
      const data = await OrderAPI.getOrders();
      console.log("✅ Fetched orders:", data);

      const arr = Array.isArray(data) ? data : [];
      // Initially set raw orders in state (optional, will overwrite with enriched later)
      setOrders(arr);

      // 1. Enrich with user names
      const userIds = [...new Set(arr.map((order) => order.uuid))];
      const usersMap = {};
      await Promise.all(
        userIds.map(async (uuid) => {
          try {
            const resp = await userAPI.getUserById(uuid);
            console.log("Fetched user:", resp);
            // adjust according to actual response shape:
            // here expecting { success: true, user: { firstName, lastName, ... } }
            let name = "Name not found";
            if (resp && resp.user) {
              const { firstName, lastName } = resp.user;
              const full = [firstName, lastName]
                .filter(Boolean)
                .join(" ")
                .trim();
              if (full) name = full;
            }
            usersMap[uuid] = name;
            console.log(`🧑‍💻 UUID: ${uuid} → Name: ${name}`);
          } catch (err) {
            console.warn(`❌ Failed to fetch user for UUID ${uuid}`, err);
            usersMap[uuid] = "Name not found";
          }
        })
      );

      // 2. Enrich with restaurant names
      // 2. Enrich with restaurant names
      const restaurantIds = [
        ...new Set(arr.map((order) => order.restaurant_id)),
      ];
      const restaurantsMap = {};
      await Promise.all(
        restaurantIds.map(async (rid) => {
          try {
            const resp = await restaurantAPI2.getRestaurantById(rid);
            console.log("Fetched restaurant:", resp);
            let name = "Name not found";

            // Fix: check resp.restaurant.name (nested)
            if (resp && resp.restaurant && resp.restaurant.name) {
              name = resp.restaurant.name;
            }
            restaurantsMap[rid] = name;
            console.log(`🏠 Restaurant ID: ${rid} → Name: ${name}`);
          } catch (err) {
            console.warn(`❌ Failed to fetch restaurant for ID ${rid}`, err);
            restaurantsMap[rid] = "Name not found";
          }
        })
      );

      // 3. Attach names to each order
      const enrichedOrders = arr.map((order) => {
        return {
          ...order,
          customerName: usersMap[order.uuid] || "Name not found",
          restaurantName:
            restaurantsMap[order.restaurant_id] || "Name not found",
        };
      });
      setOrders(enrichedOrders);

      // 4. Compute dashboard metrics
      const today = new Date().toISOString().split("T")[0];
      let ordersPlaced = enrichedOrders.length;
      let confirmedCount = 0;
      let outForDeliveryCount = 0;
      let deliveredCount = 0;
      let cancelledCount = 0;
      let globalTurnover = 0;
      let pendingCount = 0;
      let activeDeliveries = 0;
      let totalRevenueToday = 0;

      enrichedOrders.forEach((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        const total = items.reduce((sum, i) => {
          const price =
            typeof i.price === "number" ? i.price : parseFloat(i.price) || 0;
          const qty =
            typeof i.quantity === "number"
              ? i.quantity
              : parseInt(i.quantity) || 0;
          return sum + price * qty;
        }, 0);
        globalTurnover += total;

        const st = order.status;
        if (st === "pending") pendingCount++;
        if (st === "confirmed") confirmedCount++;
        if (st === "out_for_delivery") {
          outForDeliveryCount++;
          activeDeliveries++;
        }
        if (st === "delivered") deliveredCount++;
        if (st === "cancelled") cancelledCount++;

        if (order.createdAt) {
          const createdDateStr = new Date(order.createdAt)
            .toISOString()
            .split("T")[0];
          if (createdDateStr === today && st === "delivered") {
            totalRevenueToday += total;
          }
        }
      });

      setDashboardData({
        ordersPlaced,
        confirmedCount,
        outForDeliveryCount,
        deliveredCount,
        cancelledCount,
        globalTurnover,
        pendingCount,
        activeDeliveries,
        totalRevenueToday,
      });

      console.log("📊 Final Dashboard Data:", {
        ordersPlaced,
        confirmedCount,
        outForDeliveryCount,
        deliveredCount,
        cancelledCount,
        globalTurnover,
        pendingCount,
        activeDeliveries,
        totalRevenueToday,
      });
    } catch (err) {
      console.error("❌ Error fetching or computing orders:", err);
      setError("Failed to load orders data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndCompute();
  }, []);

  const StatCard = ({ icon: Icon, title, value, change }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change != null && (
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
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sales Dashboard
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={ShoppingCart}
            title="Orders Placed"
            value={loading ? "…" : dashboardData.ordersPlaced}
          />
          {/* <StatCard
            icon={CheckCircle}
            title="Orders Approved"
            value={loading ? "…" : dashboardData.confirmedCount}
          /> */}
          <StatCard
            icon={Truck}
            title="Deliveries Ongoing"
            value={loading ? "…" : dashboardData.outForDeliveryCount}
          />
          <StatCard
            icon={CreditCard}
            title="Delivered orders"
            value={loading ? "…" : dashboardData.deliveredCount}
          />
          <StatCard
            icon={AlertTriangle}
            title="Cancelled Orders"
            value={loading ? "…" : dashboardData.cancelledCount}
            color="red"
          />
        </div>

        {/* Revenue & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Global Turnover
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {loading ? "…" : `$${dashboardData.globalTurnover.toFixed(2)}`}
            </p>
            <p className="text-sm text-gray-600">Sum of all orders</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Current Activity
            </h3>
            {loading ? (
              <p>Loading…</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Orders</span>
                  <span className="font-semibold text-yellow-600">
                    {dashboardData.pendingCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Deliveries</span>
                  <span className="font-semibold text-purple-600">
                    {dashboardData.activeDeliveries}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue Today (paid)</span>
                  <span className="font-semibold text-green-600">
                    ${dashboardData.totalRevenueToday.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Orders List
          </h3>
          {loading ? (
            <p>Loading orders…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order) => {
                      const items = Array.isArray(order.items)
                        ? order.items
                        : [];
                      const orderTotal = items.reduce((sum, it) => {
                        const price =
                          typeof it.price === "number"
                            ? it.price
                            : parseFloat(it.price) || 0;
                        const qty =
                          typeof it.quantity === "number"
                            ? it.quantity
                            : parseInt(it.quantity) || 0;
                        return sum + price * qty;
                      }, 0);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.restaurantName}
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
                            ${orderTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-sm text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
