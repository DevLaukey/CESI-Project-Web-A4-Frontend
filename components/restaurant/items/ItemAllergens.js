export default function ItemAllergens({ allergens }) {
  if (!allergens || allergens.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-xs text-gray-600 mb-1">Allergens:</p>
      <div className="flex flex-wrap gap-1">
        {allergens.map((allergen, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
          >
            {allergen}
          </span>
        ))}
      </div>
    </div>
  );
}
