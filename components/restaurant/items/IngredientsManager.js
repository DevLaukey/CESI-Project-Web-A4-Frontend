import { useState } from "react";

export default function IngredientsManager({ ingredients, onUpdate }) {
  const [currentIngredient, setCurrentIngredient] = useState("");

  const addIngredient = () => {
    const trimmed = currentIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      onUpdate([...ingredients, trimmed]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredientToRemove) => {
    onUpdate(ingredients.filter((ing) => ing !== ingredientToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        Ingredients
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          onKeyPress={handleKeyPress}
          className="form-input flex-1"
          placeholder="Add ingredient..."
          maxLength={50}
        />
        <button
          type="button"
          onClick={addIngredient}
          disabled={!currentIngredient.trim()}
          className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => removeIngredient(ingredient)}
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {ingredients.length >= 20 && (
        <p className="text-sm text-yellow-600">
          Maximum 20 ingredients allowed
        </p>
      )}
    </div>
  );
}
