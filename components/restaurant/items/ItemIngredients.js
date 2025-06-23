export default function ItemIngredients({ ingredients }) {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="text-xs text-gray-600 mb-1">Ingredients:</p>
      <div className="flex flex-wrap gap-1">
        {ingredients.slice(0, 3).map((ingredient, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {ingredient}
          </span>
        ))}
        {ingredients.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            +{ingredients.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
