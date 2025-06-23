import ItemActions from "./ItemActions";
import ItemAllergens from "./ItemAllergens";
import ItemDetails from "./ItemDetails";
import ItemIngredients from "./ItemIngredients";
import { ItemsHeader } from "./ItemsHeader";
import ItemStats from "./ItemStats";
import StockManagement from "./StockManagement";

export default function ItemCard({
  item,
  categoryName,
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdateStock,
}) {


  console.log("ItemCard rendered for item:", item);
  const getStatusColor = (status) => {
    return status === "active" || item.isAvailable
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: "text-red-600", label: "Out of stock" };
    if (stock <= 5) return { color: "text-yellow-600", label: "Low stock" };
    return { color: "text-green-600", label: "In stock" };
  };

  const stockStatus = getStockStatus(item.stock || 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={
            item.image ||
            "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=100&h=100&fit=crop"
          }
          alt={item.name}
          className="w-full h-48 object-cover"
        />

        {/* Status badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              item.status
            )}`}
          >
            {item.isAvailable ? "Active" : "Inactive"}
          </span>
          {item.isPopular && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
              Popular
            </span>
          )}
        </div>

        {/* Price badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="bg-white bg-opacity-90 px-2 py-1 text-xs font-bold text-gray-900 rounded">
            ${item.price}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="bg-red-500 bg-opacity-90 px-2 py-1 text-xs font-bold text-white rounded line-through">
              ${item.originalPrice}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <ItemsHeader
          item={item}
          categoryName={categoryName}
          onToggleStatus={onToggleStatus}
        />
        <ItemDetails item={item} stockStatus={stockStatus} />
     
        <ItemActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
