// components/restaurant/OrderHistory.js
"use client";
import { useState, useEffect } from 'react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    status: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Generate dummy order history data
  const generateDummyOrders = () => {
    const statuses = ['completed', 'cancelled', 'refunded'];
    const customers = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'Tom Brown', 'Lisa Garcia', 'David Miller', 'Anna Taylor'];
    const orders = [];

    for (let i = 1; i <= 50; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90));
      
      orders.push({
        id: `123${i.toString().padStart(2, '0')}`,
        customer: customers[Math.floor(Math.random() * customers.length)],
        date: randomDate.toISOString().split('T')[0],
        time: randomDate.toLocaleTimeString(),
        items: Math.floor(Math.random() * 5) + 1,
        total: (Math.random() * 50 + 15).toFixed(2),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: Math.random() > 0.5 ? 'Card' : 'Cash',
        deliveryMethod: Math.random() > 0.3 ? 'Delivery' : 'Pickup',
        rating: Math.random() > 0.7 ? (Math.random() * 2 + 3).toFixed(1) : null,
        notes: Math.random() > 0.8 ? 'Special instructions included' : ''
      });
    }

    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completionRate: 0
  });

  useEffect(() => {
    const dummyOrders = generateDummyOrders();
    setOrders(dummyOrders);
    calculateStats(dummyOrders);
  }, []);

  const calculateStats = (orderData) => {
    const totalOrders = orderData.length;
    const completedOrders = orderData.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const avgOrderValue = totalRevenue / completedOrders.length || 0;
    const completionRate = (completedOrders.length / totalOrders) * 100;

    setStats({
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      completionRate: completionRate.toFixed(1)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Date range filter
    if (filters.dateRange !== 'custom') {
      const today = new Date();
      let filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(order => new Date(order.date) >= filterDate);
          break;
        case 'last_7_days':
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(order => new Date(order.date) >= filterDate);
          break;
        case 'last_30_days':
          filterDate.setDate(today.getDate() - 30);
          filtered = filtered.filter(order => new Date(order.date) >= filterDate);
          break;
        case 'last_3_months':
          filterDate.setMonth(today.getMonth() - 3);
          filtered = filtered.filter(order => new Date(order.date) >= filterDate);
          break;
      }
    } else if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(order => 
        order.date >= filters.startDate && order.date <= filters.endDate
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.customer.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const exportToCSV = () => {
    const filteredOrders = getFilteredOrders();
    const headers = ['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Payment', 'Delivery'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        order.customer,
        order.date,
        order.items,
        order.total,
        order.status,
        order.paymentMethod,
        order.deliveryMethod
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_history_${new Date().toISOString().split('T')[0]}.csv`;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <button 
          onClick={exportToCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{stats.totalOrders}</div>
          <div className="text-gray-600">Total Orders</div>
          <div className="text-sm text-green-600 mt-1">All time</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-green-600">${stats.totalRevenue}</div>
          <div className="text-gray-600">Total Revenue</div>
          <div className="text-sm text-green-600 mt-1">Completed orders</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">${stats.avgOrderValue}</div>
          <div className="text-gray-600">Avg Order Value</div>
          <div className="text-sm text-purple-600 mt-1">Per completed order</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-orange-600">{stats.completionRate}%</div>
          <div className="text-gray-600">Completion Rate</div>
          <div className="text-sm text-orange-600 mt-1">Success rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Rating</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.customer}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div>{order.date}</div>
                    <div className="text-xs text-gray-500">{order.time}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.items} items</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">${order.total}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    <div>{order.paymentMethod}</div>
                    <div className="text-xs text-gray-500">{order.deliveryMethod}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {order.rating ? (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{order.rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No rating</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
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
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.status !== 'all' || filters.dateRange !== 'last_30_days'
              ? 'Try adjusting your filters to see more orders.'
              : 'No order history available yet.'
            }
          </p>
          {(filters.search || filters.status !== 'all' || filters.dateRange !== 'last_30_days') && (
            <button
              onClick={() => {
                setFilters({
                  dateRange: 'last_30_days',
                  status: 'all',
                  search: '',
                  startDate: '',
                  endDate: ''
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
// }-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="today">Today</option>
//               <option value="last_7_days">Last 7 days</option>
//               <option value="last_30_days">Last 30 days</option>
//               <option value="last_3_months">Last 3 months</option>
//               <option value="custom">Custom Range</option>
//             </select>
//           </div>

//           {filters.dateRange === 'custom' && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//                 <input
//                   type="date"
//                   value={filters.startDate}
//                   onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//                 <input
//                   type="date"
//                   value={filters.endDate}
//                   onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="all">All Status</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//               <option value="refunded">Refunded</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
//             <input
//               type="text"
//               placeholder="Order ID or customer name"
//               value={filters.search}
//               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//             </div>
//             <div className="flex items-center justify-end mt-4">
//                 <button
//                     onClick={() => {
//                     setFilters({
//                         dateRange: 'last_30_days',
//                         status: 'all',
//                         search: '',
//                         startDate: '',
//                         endDate: ''
//                     });
//                     setCurrentPage(1);
//                     }}
//                     className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//                 >
//                     Clear Filters
//                 </button>
//             </div>
//           </div>
//         </div>
//       </div>
    