import { restaurantAPI } from "@/libs/api";
import ItemCard from "./ItemCard";
import {EmptyState} from "./EmptyState";

export  function ItemsList({
  items,
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdateStock,
}) {
  const getCategoryName = (categoryId) => {
    if (typeof categoryId === "string") return categoryId;
    const category = categories.find((cat) => cat.id === parseInt(categoryId));
    return category ? category.name : categoryId;
  };

  const handleDeleteItem = async (itemId) => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await restaurantAPI.deleteMenuItem(itemId);
      console.log("Item deleted:", itemId);
      onDelete();
    } catch (error) {
      console.error("Error deleting item:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to delete item: ${errorMessage}`);
    }
  };

  const handleToggleStatus = async (itemId) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const updatedData = {
        ...item,
        isAvailable: !item.isAvailable,
      };

      await restaurantAPI.updateMenuItem(itemId, updatedData);
      console.log("Item status toggled:", itemId, updatedData.isAvailable);
      onToggleStatus();
    } catch (error) {
      console.error("Error toggling item status:", error);
      alert(
        `Failed to update item status: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleUpdateStock = async (itemId, newStock) => {
    try {
      const stockValue = Math.max(0, newStock);
      await restaurantAPI.updateMenuItem(itemId, { stock: stockValue });
      console.log("Stock updated:", itemId, stockValue);
      onUpdateStock();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert(
        `Failed to update stock: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ItemCard
          key={String(item.id)}
          item={item}
          categoryName={getCategoryName(item.category)}
          onEdit={() => onEdit(item)}
          onDelete={() => handleDeleteItem(item.id)}
          onToggleStatus={() => handleToggleStatus(item.id)}
          onUpdateStock={(newStock) => handleUpdateStock(item.id, newStock)}
        />
      ))}
    </div>
  );
}
