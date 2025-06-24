"use client";
import { useState, useEffect } from "react";
import { restaurantAPI } from "@/libs/api";
import CreateMenuModal from "./CreateMenuModal";
import EditMenuModal from "./EditMenuModal";

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Load menus and available items on component mount
  useEffect(() => {
    loadMenus();
    loadAvailableItems();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantAPI.getMenus();
      setMenus(data.menus || []);
    } catch (err) {
      console.error("Error loading menus:", err);
      setError("Failed to load menus. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableItems = async () => {
    try {
      setItemsLoading(true);
      const params = {
        page: 1,
        limit: 100,
        status: "active",
      };
      const response = await restaurantAPI.getItems(params);
      setAvailableItems(response?.items || []);
    } catch (err) {
      console.error("Error loading items:", err);
      setAvailableItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleDeleteMenu = async (menuId) => {
    const menu = menus.find((m) => m.id === menuId);

    if (
      !confirm(
        `Are you sure you want to delete "${menu.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setError(null);
      await restaurantAPI.deleteMenu(menuId);
      setMenus((prev) => prev.filter((menu) => menu.id !== menuId));
    } catch (err) {
      console.error("Error deleting menu:", err);
      setError("Failed to delete menu. Please try again.");
    }
  };

  const handleMenuCreated = (newMenu) => {
    setMenus((prev) => [...prev, newMenu]);
    setShowCreateModal(false);
  };

  const handleMenuUpdated = (updatedMenu) => {
    setMenus((prev) =>
      prev.map((menu) => (menu.id === updatedMenu.id ? updatedMenu : menu))
    );
    setSelectedMenu(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    // Reload items when opening create modal to ensure fresh data
    if (availableItems.length === 0) {
      loadAvailableItems();
    }
  };

  const openEditModal = (menu) => {
    setSelectedMenu(menu);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading menus...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <button
          onClick={openCreateModal}
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

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
            {menus.reduce((sum, menu) => sum + (menu.itemCount || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            $
            {menus
              .reduce((sum, menu) => {
                const price =
                  typeof menu.price === "string"
                    ? parseFloat(menu.price)
                    : menu.price;
                return sum + (price || 0);
              }, 0)
              .toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus?.map((menu) => (
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-green-600">
                    $
                    {typeof menu.price === "string"
                      ? parseFloat(menu.price).toFixed(2)
                      : menu.price?.toFixed(2) || "0.00"}
                  </span>
                  {menu.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      $
                      {typeof menu.originalPrice === "string"
                        ? parseFloat(menu.originalPrice).toFixed(2)
                        : menu.originalPrice?.toFixed(2) || "0.00"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-2">
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
                <span className="text-gray-600">Prep Time:</span>
                <span className="font-medium">
                  {menu.preparationTime || 20} min
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">
                  {Array.isArray(menu.items) ? menu.items.length : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sort Order:</span>
                <span className="font-medium">{menu.sortOrder || 0}</span>
              </div>
            </div>

            {/* Tags */}
            {menu.tags && Array.isArray(menu.tags) && menu.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Tags:</p>
                <div className="flex flex-wrap gap-1">
                  {menu.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {typeof tag === "string" ? tag : tag.name || "Tag"}
                    </span>
                  ))}
                  {menu.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{menu.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(menu)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Menu
              </button>
              <button className="bg-gray-200 text-gray-700 py-2 px-3 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {menus.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No menus created yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first menu to start organizing your items.
          </p>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Menu
          </button>
        </div>
      )}

      {/* Create Menu Modal */}
      {showCreateModal && (
        <CreateMenuModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onMenuCreated={handleMenuCreated}
          availableItems={availableItems}
          itemsLoading={itemsLoading}
          onRetryLoadItems={loadAvailableItems}
        />
      )}

      {/* Edit Menu Modal */}
      {selectedMenu && (
        <EditMenuModal
          isOpen={!!selectedMenu}
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          onMenuUpdated={handleMenuUpdated}
          availableItems={availableItems}
          itemsLoading={itemsLoading}
          onRetryLoadItems={loadAvailableItems}
        />
      )}
    </div>
  );
}
