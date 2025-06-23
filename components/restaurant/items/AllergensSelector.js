export default function AllergensSelector({
  allergens,
  availableAllergens,
  onUpdate,
}) {
  const toggleAllergen = (allergen) => {
    if (allergens.includes(allergen)) {
      onUpdate(allergens.filter((a) => a !== allergen));
    } else {
      onUpdate([...allergens, allergen]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        Allergens
      </label>
      <div className="grid grid-cols-3 gap-2">
        {availableAllergens.map((allergen) => (
          <label
            key={allergen}
            className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={allergens.includes(allergen)}
              onChange={() => toggleAllergen(allergen)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 capitalize">{allergen}</span>
          </label>
        ))}
      </div>
      {allergens.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">Selected allergens:</p>
          <div className="flex flex-wrap gap-1">
            {allergens.map((allergen) => (
              <span
                key={allergen}
                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
