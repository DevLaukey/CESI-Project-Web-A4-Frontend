import { useState, useEffect } from "react";
import { restaurantAPI } from "@/libs/api";
import FormField from "./FormField";
import FormError from "./FormError";
import ModalWrapper from "./ModalWrapper";
import IngredientsManager from "./IngredientsManager";
import AllergensSelector from "./AllergensSelector";
import NutritionalInfo from "./NutritionalInfo";
import ToggleField from "./ToggleField";

export  function EditItemModal({
  item,
  categories,
  categoriesLoaded,
  onClose,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [updateError, setUpdateError] = useState('');

  const [editItem, setEditItem] = useState({
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
    stock: 0,
  });

  const commonAllergens = [
    "gluten", "dairy", "eggs", "nuts", "peanuts", 
    "soy", "fish", "shellfish", "sesame"
  ];

  // Initialize form with item data
  useEffect(() => {
    if (item) {
      setEditItem({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        originalPrice: item.originalPrice || "",
        categoryId: item.categoryId || item.category?.id || "",
        isAvailable: item.isAvailable ?? true,
        isPopular: item.isPopular ?? false,
        ingredients: item.ingredients || [],
        allergens: item.allergens || [],
        nutritionalInfo: {
          calories: item.nutritionalInfo?.calories || "",
          protein: item.nutritionalInfo?.protein || "",
          carbs: item.nutritionalInfo?.carbs || "",
          fat: item.nutritionalInfo?.fat || "",
        },
        preparationTime: item.preparationTime || "",
        sortOrder: item.sortOrder || 0,
        stock: item.stock || 0,
      });
    }
  }, [item]);

  const clearErrors = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
    if (updateError) setUpdateError('');
  };

  const validateForm = () => {
    const errors = {};

    if (!editItem.name.trim()) {
      errors.name = 'Item name is required';
    }

    if (!editItem.price || parseFloat(editItem.price) <= 0) {
      errors.price = 'Please enter a valid price';
    }

    if (!editItem.categoryId) {
      errors.categoryId = 'Please select a category';
    }

    if (editItem.originalPrice && parseFloat(editItem.originalPrice) <= parseFloat(editItem.price)) {
      errors.originalPrice = 'Original price must be higher than current price';
    }

    if (editItem.stock < 0) {
      errors.stock = 'Stock cannot be negative';
    }

    return errors;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setFieldErrors({});
    setUpdateError('');

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);
    
    try {
      const updateData = {
        name: editItem.name.trim(),
        description: editItem.description.trim(),
        price: parseFloat(editItem.price),
        originalPrice: editItem.originalPrice ? parseFloat(editItem.originalPrice) : undefined,
        categoryId: parseInt(editItem.categoryId),
        isAvailable: editItem.isAvailable,
        isPopular: editItem.isPopular,
        ingredients: editItem.ingredients,
        allergens: editItem.allergens,
        nutritionalInfo: {
          calories: editItem.nutritionalInfo.calories ? parseInt(editItem.nutritionalInfo.calories) : undefined,
          protein: editItem.nutritionalInfo.protein ? parseFloat(editItem.nutritionalInfo.protein) : undefined,
          carbs: editItem.nutritionalInfo.carbs ? parseFloat(editItem.nutritionalInfo.carbs) : undefined,
          fat: editItem.nutritionalInfo.fat ? parseFloat(editItem.nutritionalInfo.fat) : undefined,
        },
        preparationTime: parseInt(editItem.preparationTime) || 15,
        sortOrder: parseInt(editItem.sortOrder) || 0,
        stock: parseInt(editItem.stock) || 0,
      };

      await restaurantAPI.updateMenuItem(item.id, updateData);
      onSuccess();
      
    } catch (error) {
      console.error("Error updating menu item:", error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
          setUpdateError(errorData.message || 'Please fix the highlighted errors');
        } else {
          setUpdateError(errorData.message || 'Failed to update item');
        }
      } else {
        setUpdateError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setEditItem(prev => ({ ...prev, [field]: value }));
    clearErrors(field);
  };

  const updateNestedField = (parent, field, value) => {
    setEditItem(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  return (
    <ModalWrapper
      title="Edit Item"
      subtitle="Update menu item details"
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Item Name */}
        <FormField
          label="Item Name"
          required
          error={fieldErrors.name}
        >
          <input
            type="text"
            value={editItem.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="form-input"
            placeholder="e.g., Margherita Pizza"
          />
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          error={fieldErrors.description}
        >
          <textarea
            value={editItem.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="form-textarea"
            rows="3"
            placeholder="Brief description of the item..."
          />
        </FormField>

        {/* Category, Price, and Original Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            label="Category"
            required
            error={fieldErrors.categoryId}
          >
            <select
              value={editItem.categoryId}
              onChange={(e) => updateField('categoryId', e.target.value)}
              className="form-select"
              disabled={!categoriesLoaded}
            >
              <option value="">
                {categoriesLoaded ? "Select category" : "Loading categories..."}
              </option>
              {categoriesLoaded && categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Price"
            required
            error={fieldErrors.price}
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999.99"
                value={editItem.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="form-input pl-8"
                placeholder="0.00"
              />
            </div>
          </FormField>

          <FormField
            label="Original Price"
            error={fieldErrors.originalPrice}
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999.99"
                value={editItem.originalPrice}
                onChange={(e) => updateField('originalPrice', e.target.value)}
                className="form-input pl-8"
                placeholder="0.00"
              />
            </div>
          </FormField>
        </div>

        {/* Stock, Prep Time, and Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            label="Current Stock"
            error={fieldErrors.stock}
          >
            <input
              type="number"
              min="0"
              max="1000"
              value={editItem.stock}
              onChange={(e) => updateField('stock', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </FormField>

          <FormField label="Prep Time">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="180"
                value={editItem.preparationTime}
                onChange={(e) => updateField('preparationTime', e.target.value)}
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
              value={editItem.sortOrder}
              onChange={(e) => updateField('sortOrder', e.target.value)}
              className="form-input"
              placeholder="0"
            />
          </FormField>
        </div>

        {/* Availability and Popular Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ToggleField
            label="Availability"
            value={editItem.isAvailable}
            onChange={(value) => updateField('isAvailable', value)}
            activeText="Available"
            inactiveText="Unavailable"
            activeColor="bg-blue-600"
          />

          <ToggleField
            label="Popular Item"
            value={editItem.isPopular}
            onChange={(value) => updateField('isPopular', value)}
            activeText="Popular"
            inactiveText="Regular"
            activeColor="bg-orange-500"
          />
        </div>

        {/* Ingredients */}
        <IngredientsManager
          ingredients={editItem.ingredients}
          onUpdate={(ingredients) => updateField('ingredients', ingredients)}
        />

        {/* Allergens */}
        <AllergensSelector
          allergens={editItem.allergens}
          availableAllergens={commonAllergens}
          onUpdate={(allergens) => updateField('allergens', allergens)}
        />

        {/* Nutritional Information */}
        <NutritionalInfo
          nutritionalInfo={editItem.nutritionalInfo}
          onUpdate={(field, value) => updateNestedField('nutritionalInfo', field, value)}
        />
      </div>

      {/* Error Display */}
      <FormError
        createError={updateError}
        fieldErrors={fieldErrors}
      />

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
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </>
          ) : !categoriesLoaded ? (
            "Loading..."
          ) : (
            "Update Item"
          )}
        </button>
      </div>
    </ModalWrapper>
  );
}
