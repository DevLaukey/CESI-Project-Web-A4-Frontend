// components/restaurant/MenuManagement.js
"use client";
import { useState, useEffect } from "react";

export default function MenuManagement() {
  const [menus, setMenus] = useState([
    {
      id: 1,
      name: "Main Menu",
      description: "Our signature dishes and daily favorites",
      itemCount: 24,
      status: "active",
      lastUpdated: "2024-12-20",
      categories: ["Pizza", "Pasta", "Salads", "Desserts"],
    },
    {
      id: 2,
      name: "Breakfast Menu",
      description: "Early morning delights and coffee",
      itemCount: 12,
      status: "active",
      lastUpdated: "2024-12-18",
      categories: ["Breakfast", "Coffee", "Pastries"],
    },
    {
      id: 3,
      name: "Happy Hour",
      description: "Special pricing for evening appetizers",
      itemCount: 8,
      status: "inactive",
      lastUpdated: "2024-12-15",
      categories: ["Appetizers", "Drinks"],
    },
    {
      id: 4,
      name: "Weekend Special",
      description: "Exclusive weekend offerings",
      itemCount: 6,
      status: "active",
      lastUpdated: "2024-12-19",
      categories: ["Specials", "Brunch"],
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const handleCreateMenu = () => {
    if (newMenu.name.trim()) {
      const menu = {
        id: Date.now(),
        name: newMenu.name,
        description: newMenu.description,
        itemCount: 0,
        status: newMenu.status,
        lastUpdated: new Date().toISOString().split("T")[0],
        categories: [],
      };

      setMenus((prev) => [...prev, menu]);
      setNewMenu({ name: "", description: "", status: "active" });
      setShowCreateModal(false);
    }
  };

  const handleDeleteMenu = (menuId) => {
    if (confirm("Are you sure you want to delete this menu?")) {
      setMenus((prev) => prev.filter((menu) => menu.id !== menuId));
    }
  };

  const toggleMenuStatus = (menuId) => {
    setMenus((prev) =>
      prev.map((menu) =>
        menu.id === menuId
          ? {
              ...menu,
              status: menu.status === "active" ? "inactive" : "active",
            }
          : menu
      )
    );
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Menu
        </button>
      </div>

      {/* Menu Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{menus.length}</div>
          <div className="text-sm text-gray-600">Total Menus</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {menus.filter((m) => m.status === "active").length}
          </div>
          <div className="text-sm text-gray-600">Active Menus</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {menus.reduce((sum, menu) => sum + menu.itemCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(menus.flatMap((m) => m.categories)).size}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div
            key={menu.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {menu.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    menu.status
                  )}`}
                >
                  {menu.status}
                </span>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => toggleMenuStatus(menu.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={menu.status === "active" ? "Deactivate" : "Activate"}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteMenu(menu.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete menu"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{menu.itemCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last updated:</span>
                <span className="font-medium">{menu.lastUpdated}</span>
              </div>
            </div>

            {/* Categories */}
            {menu.categories.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Categories:</p>
                <div className="flex flex-wrap gap-1">
                  {menu.categories.slice(0, 3).map((category, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {category}
                    </span>
                  ))}
                  {menu.categories.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{menu.categories.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMenu(menu)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Menu
              </button>
              <button className="bg-gray-200 text-gray-700 py-2 px-3 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                View Items
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {menus.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No menus created yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first menu to start organizing your items.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Menu
          </button>
        </div>
      )}

      {/* Create Menu Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Menu</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={newMenu.name}
                  onChange={(e) =>
                    setNewMenu((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Lunch Menu, Dinner Specials"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newMenu.description}
                  onChange={(e) =>
                    setNewMenu((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Brief description of this menu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newMenu.status}
                  onChange={(e) =>
                    setNewMenu((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMenu}
                disabled={!newMenu.name.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {selectedMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Menu</h3>
              <button
                onClick={() => setSelectedMenu(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedMenu.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  defaultValue={selectedMenu.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  defaultValue={selectedMenu.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Items:</strong> {selectedMenu.itemCount}
                  </p>
                  <p>
                    <strong>Categories:</strong>{" "}
                    {selectedMenu.categories.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Last Updated:</strong> {selectedMenu.lastUpdated}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedMenu(null)}
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
