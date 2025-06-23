export function ItemsHeader({ item, onCreateClick }) {
  console.log("Rendering ItemsHeader with item:", item);
  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {item?.name}
            </h1>
            {item?.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {typeof item.category === "object"
                  ? item.category.name
                  : item.category}
              </span>
            )}
          </div>
        </div>
      </div>
  );
}
