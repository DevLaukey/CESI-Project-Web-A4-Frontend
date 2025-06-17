// components/restaurant/ItemsManagement.js
"use client";
import { useState, useEffect } from 'react';

export default function ItemsManagement() {
  const [items, setItems] = useState([
    { 
      id: 1, 
      name: 'Margherita Pizza', 
      category: 'Pizza', 
      price: 18.99, 
      status: 'active', 
      stock: 5,
      description: 'Fresh tomatoes, mozzarella, basil',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
      preparationTime: 15
    },
    { 
      id: 2, 
      name: 'Caesar Salad', 
      category: 'Salads', 
      price: 12.50, 
      status: 'active', 
      stock: 12,
      description: 'Romaine lettuce, parmesan, croutons',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop',
      preparationTime: 8
    },
    { 
      id: 3, 
      name: 'Pasta Carbonara', 
      category: 'Pasta', 
      price: 16.75, 
      status: 'inactive', 
      stock: 0,
      description: 'Spaghetti, bacon, eggs, parmesan',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=100&h=100&fit=crop',
      preparationTime: 12
    },
    { 
      id: 4, 
      name: 'Chicken Wings', 
      category: 'Appetizers', 
      price: 14.99, 
      status: 'active', 
      stock: 8,
      description: 'Spicy buffalo wings with ranch',
      image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=100&h=100&fit=crop',
      preparationTime: 20
    },
  ]);

  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: '',
    preparationTime: '',
    status: 'active'
  });

  const categories = ['Pizza', 'Pasta', 'Salads', 'Appetizers', 'Desserts', 'Beverages', 'Main Course'];

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-600', label: 'Out of stock' };
    if (stock <= 5) return { color: 'text-yellow-600', label: 'Low stock' };
    return { color: 'text-green-600', label: 'In stock' };
  };

  const getFilteredItems = () => {
    return items.filter(item => {
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           item.description.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  };

  const handleCreateItem = () => {
    if (newItem.name.trim() && newItem.price && newItem.category) {
      const item = {
        id: Date.now(),
        name: newItem.name,
        category: newItem.category,
        price: parseFloat(newItem.price),
        description: newItem.description,
        stock: parseInt(newItem.stock) || 0,
        preparationTime: parseInt(newItem.preparationTime) || 0,
        status: newItem.status,
        image: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=100&h=100&fit=crop'
      };
      
      setItems(prev => [...prev, item]);
      setNewItem({
        name: '',
        category: '',
        price: '',
        description: '',
        stock: '',
        preparationTime: '',
        status: 'active'
      });
      setShowCreateModal(false);
    }
  };

  const handleDeleteItem = (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const toggleItemStatus = (itemId) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
          : item
      )
    );
  };

  const updateStock = (itemId, newStock) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, stock: Math.max(0, newStock) }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Item Management</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredItems().map((item) => {
          const stockStatus = getStockStatus(item.stock);
          
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-white bg-opacity-90 px-2 py-1 text-xs font-bold text-gray-900 rounded">
                    ${item.price}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <button 
                    onClick={() => toggleItemStatus(item.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={item.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{item.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${stockStatus.color}`}>
                      {item.stock} - {stockStatus.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prep time:</span>
                    <span className="font-medium">{item.preparationTime} min</span>
                  </div>
                </div>

                {/* Stock Management */}
                <div className="flex items-center gap-2 mb-4">
                  <button 
                    onClick={() => updateStock(item.id, item.stock - 1)}
                    disabled={item.stock === 0}
                    className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-medium text-center min-w-[3rem]">{item.stock}</span>
                  <button 
                    onClick={() => updateStock(item.id, item.stock + 1)}
                    className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="bg-red-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {getFilteredItems().length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.category !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your filters to see more items.'
              : 'Create your first menu item to get started.'
            }
          </p>
          {!filters.search && filters.category === 'all' && filters.status === 'all' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Item
            </button>
          )}
        </div>
      )}

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Item</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input 
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input 
                    type="number"
                    step="0.01"
                    defaultValue={selectedItem.price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  defaultValue={selectedItem.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input 
                    type="number"
                    defaultValue={selectedItem.stock}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input 
                    type="number"
                    defaultValue={selectedItem.preparationTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  defaultValue={selectedItem.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p><strong>Current Image:</strong></p>
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-16 h-16 object-cover rounded mt-2" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}