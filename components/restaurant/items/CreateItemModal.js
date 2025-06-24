import { useState } from "react";
import { restaurantAPI } from "@/libs/api";
import FormField from "./FormField";
import FormError from "./FormError";
import ModalWrapper from "./ModalWrapper";
import IngredientsManager from "./IngredientsManager";
import AllergensSelector from "./AllergensSelector";
import NutritionalInfo from "./NutritionalInfo";
import ToggleField from "./ToggleField";

export function CreateItemModal({
  categories,
  categoriesLoaded,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [createError, setCreateError] = useState("");

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    isAvailable: true,
    isPopular: false,
    ingredients: [],
    allergens: [],
    nutritionalInfo: {
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    },
    preparationTime: "",
    sortOrder: 0,
  });

  const commonAllergens = [
    "gluten",
    "dairy",
    "eggs",
    "nuts",
    "peanuts",
    "soy",
    "fish",
    "shellfish",
    "sesame",
  ];

  const clearErrors = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
    if (createError) setCreateError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!newItem.name.trim()) {
      errors.name = "Item name is required";
    }

    if (!newItem.price || parseFloat(newItem.price) <= 0) {
      errors.price = "Please enter a valid price";
    }

    if (!newItem.categoryId) {
      errors.categoryId = "Please select a category";
    }

    if (
      newItem.originalPrice &&
      parseFloat(newItem.originalPrice) <= parseFloat(newItem.price)
    ) {
      errors.originalPrice = "Original price must be higher than current price";
    }

    return errors;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setFieldErrors({});
    setCreateError("");

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const itemData = {
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: parseFloat(newItem.price),
        originalPrice: newItem.originalPrice
          ? parseFloat(newItem.originalPrice)
          : undefined,
        categoryId: parseInt(newItem.categoryId),
        isAvailable: newItem.isAvailable,
        isPopular: newItem.isPopular,
        ingredients: newItem.ingredients,
        allergens: newItem.allergens,
        nutritionalInfo: {
          calories: newItem.nutritionalInfo.calories
            ? parseInt(newItem.nutritionalInfo.calories)
            : undefined,
          protein: newItem.nutritionalInfo.protein
            ? parseFloat(newItem.nutritionalInfo.protein)
            : undefined,
          carbs: newItem.nutritionalInfo.carbs
            ? parseFloat(newItem.nutritionalInfo.carbs)
            : undefined,
          fat: newItem.nutritionalInfo.fat
            ? parseFloat(newItem.nutritionalInfo.fat)
            : undefined,
        },
        preparationTime: parseInt(newItem.preparationTime) || 15,
        sortOrder: parseInt(newItem.sortOrder) || 0,
      };

      await restaurantAPI.addMenuItem(itemData);
      onSuccess();
    } catch (error) {
      console.error("Error adding menu item:", error);

      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle validation errors with field-specific messages
        if (errorData.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
          setCreateError(
            errorData.message || "Please fix the highlighted errors"
          );
        } else {
          setCreateError(errorData.message || "Failed to create item");
        }
      } else {
        setCreateError(
          "Network error. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
    clearErrors(field);
  };

  const updateNestedField = (parent, field, value) => {
    setNewItem((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  return (
    <ModalWrapper
      title="Add New Item"
      subtitle="Create a new menu item for your restaurant"
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Item Name */}
        <FormField label="Item Name" required error={fieldErrors.name}>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="form-input"
            placeholder="e.g., Margherita Pizza"
          />
        </FormField>

        {/* Description */}
        <FormField label="Description" error={fieldErrors.description}>
          <textarea
            value={newItem.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="form-textarea"
            rows="3"
            placeholder="Brief description of the item..."
          />
        </FormField>

        {/* Category, Price, and Original Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Category" required error={fieldErrors.categoryId}>
            <select
              value={newItem.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className="form-select"
              disabled={!categoriesLoaded}
            >
              <option value="">
                {categoriesLoaded ? "Select category" : "Loading categories..."}
              </option>
              {categoriesLoaded &&
                categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="Price" required error={fieldErrors.price}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999.99"
                value={newItem.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="form-input pl-8"
                placeholder="0.00"
              />
            </div>
          </FormField>

          <FormField label="Original Price" error={fieldErrors.originalPrice}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999.99"
                value={newItem.originalPrice}
                onChange={(e) => updateField("originalPrice", e.target.value)}
                className="form-input pl-8"
                placeholder="0.00"
              />
            </div>
            {newItem.originalPrice &&
              newItem.price &&
              parseFloat(newItem.originalPrice) <=
                parseFloat(newItem.price) && (
                <p className="mt-1 text-sm text-yellow-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Original price should be higher than current price
                </p>
              )}
          </FormField>
        </div>

        {/* Prep Time and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Prep Time">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="180"
                value={newItem.preparationTime}
                onChange={(e) => updateField("preparationTime", e.target.value)}
                className="form-input"
                placeholder="15"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                min
              </span>
            </div>
          </FormField>

          <FormField label="Sort Order">
            <input
              type="number"
              min="0"
              value={newItem.sortOrder}
              onChange={(e) => updateField("sortOrder", e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </FormField>
        </div>

        {/* Availability and Popular Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ToggleField
            label="Availability"
            value={newItem.isAvailable}
            onChange={(value) => updateField("isAvailable", value)}
            activeText="Available"
            inactiveText="Unavailable"
            activeColor="bg-blue-600"
          />

          <ToggleField
            label="Popular Item"
            value={newItem.isPopular}
            onChange={(value) => updateField("isPopular", value)}
            activeText="Popular"
            inactiveText="Regular"
            activeColor="bg-orange-500"
          />
        </div>

        {/* Ingredients */}
        <IngredientsManager
          ingredients={newItem.ingredients}
          onUpdate={(ingredients) => updateField("ingredients", ingredients)}
        />

        {/* Allergens */}
        <AllergensSelector
          allergens={newItem.allergens}
          availableAllergens={commonAllergens}
          onUpdate={(allergens) => updateField("allergens", allergens)}
        />

        {/* Nutritional Information */}
        <NutritionalInfo
          nutritionalInfo={newItem.nutritionalInfo}
          onUpdate={(field, value) =>
            updateNestedField("nutritionalInfo", field, value)
          }
        />
      </div>

      {/* Error Display */}
      <FormError createError={createError} fieldErrors={fieldErrors} />

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !categoriesLoaded}
          className="btn-primary flex-1"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : !categoriesLoaded ? (
            "Loading..."
          ) : (
            "Create Item"
          )}
        </button>
      </div>
    </ModalWrapper>
  );
}
