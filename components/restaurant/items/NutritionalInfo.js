export default function NutritionalInfo({ nutritionalInfo, onUpdate }) {
  const fields = [
    { key: "calories", label: "Calories", unit: "kcal", max: 5000 },
    { key: "protein", label: "Protein", unit: "g", max: 200, step: "0.1" },
    { key: "carbs", label: "Carbs", unit: "g", max: 500, step: "0.1" },
    { key: "fat", label: "Fat", unit: "g", max: 200, step: "0.1" },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        Nutritional Information (Optional)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fields.map(({ key, label, unit, max, step = "1" }) => (
          <div key={key} className="space-y-1">
            <input
              type="number"
              step={step}
              min="0"
              max={max}
              value={nutritionalInfo[key]}
              onChange={(e) => onUpdate(key, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder={label}
            />
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        ))}
      </div>
      {Object.values(nutritionalInfo).some((value) => value) && (
        <p className="text-xs text-gray-600 mt-2">
          💡 Nutritional information helps customers make informed choices
        </p>
      )}
    </div>
  );
}
