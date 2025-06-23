"use client";
import { useState, useEffect } from "react";
import { restaurantAPI } from "@/libs/api";
import {ItemsHeader} from "./items/ItemsHeader";
import {ItemsFilters} from "./items/ItemsFilters";
import {ItemsList} from "./items/ItemsList";
import {ItemsPagination} from "./items/ItemsPagination";
import {CreateItemModal} from "./items/CreateItemModal";
import {EditItemModal} from "./items/EditItemModal";
import LoadingSpinner from "./LoadingSpinner";
import {ErrorMessage} from "./items/ErrorMessage";

export default function ItemsManagement() {
  // State management
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Pagination and filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    q: "",
    category: "all",
    status: "all",
    minPrice: "",
    maxPrice: "",
    allergens: [],
  });

  // Fallback categories
  const fallbackCategories = [
    { id: 1, name: "Pizza" },
    { id: 2, name: "Pasta" },
    { id: 3, name: "Salads" },
    { id: 4, name: "Appetizers" },
    { id: 5, name: "Desserts" },
    { id: 6, name: "Beverages" },
    { id: 7, name: "Main Course" },
  ];

  // Fetch items from API
  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.q?.trim()) params.append("q", filters.q.trim());
      if (filters.category && filters.category !== "all")
        params.append("category", filters.category);
      if (filters.minPrice)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.allergens && filters.allergens.length > 0)
        params.append("allergens", filters.allergens.join(","));

      const response = await restaurantAPI.getItems(params);
      setItems(response?.items || []);
      setPagination((prev) => ({
        ...prev,
        total: response?.pagination.totalCount || 0,
        totalPages: response?.pagination.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(error.response?.data?.message || "Failed to fetch items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await restaurantAPI.getCategories();

      console.log("Fetched categories:", response.data);
      setCategories(response.categories || fallbackCategories);
      setCategoriesLoaded(true);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(fallbackCategories);
      setCategoriesLoaded(true);
    }
  };

  // Effects
  useEffect(() => {
    fetchItems();
  }, [
    filters.q,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.allergens,
    filters.status,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    if (!categoriesLoaded) {
      fetchCategories();
    }
  }, [categoriesLoaded]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleItemCreated = () => {
    setShowCreateModal(false);
    fetchItems();
  };

  const handleItemUpdated = () => {
    setSelectedItem(null);
    fetchItems();
  };

  const handleItemDeleted = () => {
    fetchItems();
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      category: "all",
      status: "all",
      minPrice: "",
      maxPrice: "",
      allergens: [],
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <ItemsHeader onCreateClick={() => setShowCreateModal(true)} />

      <ItemsFilters
        filters={filters}
        categories={categories}
        categoriesLoaded={categoriesLoaded}
        pagination={pagination}
        onFilterChange={handleFilterChange}
        onLimitChange={(limit) =>
          setPagination((prev) => ({ ...prev, limit, page: 1 }))
        }
        onClearFilters={clearFilters}
      />

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={fetchItems} />}

      {!loading && !error && (
        <>
          <ItemsList
            items={items}
            categories={categories}
            onEdit={setSelectedItem}
            onDelete={handleItemDeleted}
            onToggleStatus={fetchItems}
            onUpdateStock={fetchItems}
          />

          {pagination.totalPages > 1 && (
            <ItemsPagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateItemModal
          categories={categories}
          categoriesLoaded={categoriesLoaded}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleItemCreated}
        />
      )}

      {selectedItem && (
        <EditItemModal
          item={selectedItem}
          categories={categories}
          categoriesLoaded={categoriesLoaded}
          onClose={() => setSelectedItem(null)}
          onSuccess={handleItemUpdated}
        />
      )}
    </div>
  );
}
