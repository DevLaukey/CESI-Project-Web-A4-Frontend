"use client";
import { useState, useEffect } from "react";
import { restaurantAPI } from "@/libs/api";
import FormField from "./items/FormField";
import FormError from "./items/FormError";
import ModalWrapper from "./items/ModalWrapper";

export default function CreateMenuModal({
  isOpen,
  onClose,
  onMenuCreated,
  availableItems,
  itemsLoading,
  onRetryLoadItems,
}) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [createError, setCreateError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newImage, setNewImage] = useState("");

  const [newMenu, setNewMenu] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    preparationTime: "20",
    images: [],
    tags: [],
    validFrom: "",
    validUntil: "",
    sortOrder: "0",
    items: [],
    isAutoPricing: true,
  });

  // Calculate price from selected items
  const calculatePriceFromItems = (menuItems) => {
    if (!menuItems || menuItems.length === 0) return 0;

    return menuItems.reduce((total, menuItem) => {
      const item = availableItems.find((item) => item.id === menuItem.itemId);
      if (!item) return total;

      // Handle price as string from API
      const basePrice = parseFloat(item.price) || 0;
      const quantity = menuItem.quantity || 1;
      const extraPrice = parseFloat(menuItem.extraPrice) || 0;

      return total + basePrice * quantity + extraPrice;
    }, 0);
  };

  // Update menu price when items change
  useEffect(() => {
    if (newMenu.isAutoPricing) {
      const calculatedPrice = calculatePriceFromItems(newMenu.items);
      setNewMenu((prev) => ({
        ...prev,
        price: calculatedPrice.toFixed(2),
      }));
    }
  }, [newMenu.items, newMenu.isAutoPricing, availableItems]);

  const clearErrors = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
    if (createError) setCreateError("");
  };

  const validateForm = (menuData) => {
    const errors = {};

    // Name validation
    if (!menuData.name.trim()) {
      errors.name = "Menu name is required";
    } else if (menuData.name.trim().length < 2) {
      errors.name = "Menu name must be at least 2 characters long";
    } else if (menuData.name.trim().length > 100) {
      errors.name = "Menu name cannot exceed 100 characters";
    }

    // Description validation
    if (menuData.description && menuData.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    // Price validation - only if manual pricing is enabled
    if (!menuData.isAutoPricing) {
      if (!menuData.price || menuData.price === "") {
        errors.price = "Price is required when auto-pricing is disabled";
      } else {
        const price = parseFloat(menuData.price);
        if (isNaN(price) || price < 0) {
          errors.price = "Price cannot be negative";
        } else if (price > 1000) {
          errors.price = "Price cannot exceed 1000";
        }
      }
    }

    // Original price validation
    if (menuData.originalPrice && menuData.originalPrice !== "") {
      const originalPrice = parseFloat(menuData.originalPrice);
      const price = parseFloat(menuData.price);

      if (isNaN(originalPrice) || originalPrice < 0) {
        errors.originalPrice = "Original price cannot be negative";
      } else if (originalPrice > 1000) {
        errors.originalPrice = "Original price cannot exceed 1000";
      } else if (!isNaN(price) && originalPrice <= price) {
        errors.originalPrice =
          "Original price must be higher than current price";
      }
    }

    // Preparation time validation
    if (menuData.preparationTime) {
      const prepTime = parseInt(menuData.preparationTime);
      if (isNaN(prepTime) || prepTime < 10) {
        errors.preparationTime = "Preparation time must be at least 10 minutes";
      } else if (prepTime > 120) {
        errors.preparationTime = "Preparation time cannot exceed 120 minutes";
      }
    }

    // Images validation
    if (menuData.images && menuData.images.length > 5) {
      errors.images = "Cannot have more than 5 images";
    }

    // Tags validation
    if (menuData.tags && menuData.tags.length > 10) {
      errors.tags = "Cannot have more than 10 tags";
    }

    // Date validation
    if (menuData.validFrom && menuData.validUntil) {
      const validFrom = new Date(menuData.validFrom);
      const validUntil = new Date(menuData.validUntil);

      if (validUntil <= validFrom) {
        errors.validUntil = "Valid until date must be after valid from date";
      }
    }

    // Items validation
    if (menuData.items && menuData.items.length > 20) {
      errors.items = "Menu cannot contain more than 20 items";
    }

    // Validate individual items
    if (menuData.items && menuData.items.length > 0) {
      menuData.items.forEach((item, index) => {
        if (!item.itemId || item.itemId <= 0) {
          errors[`items.${index}.itemId`] = "Item ID must be a positive number";
        }
        if (item.quantity && (item.quantity < 1 || item.quantity > 10)) {
          errors[`items.${index}.quantity`] =
            "Quantity must be between 1 and 10";
        }
        if (item.extraPrice && (item.extraPrice < 0 || item.extraPrice > 100)) {
          errors[`items.${index}.extraPrice`] =
            "Extra price must be between 0 and 100";
        }
      });
    }

    return errors;
  };

  // Helper function to get item name by ID
  const getItemName = (itemId) => {
    const item = availableItems.find((item) => item.id === itemId);
    return item ? item.name : `Item #${itemId}`;
  };

  // Helper function to get item details by ID
  const getItemDetails = (itemId) => {
    const item = availableItems.find((item) => item.id === itemId);
    if (!item)
      return {
        name: `Item #${itemId}`,
        price: 0,
        category: "",
        isAvailable: false,
      };

    return {
      name: item.name,
      price: parseFloat(item.price) || 0,
      category: item.category?.name || "",
      isAvailable: item.isAvailable,
    };
  };

  // Helper function to add item to menu
  const addItemToMenu = (itemId) => {
    const numericItemId = parseInt(itemId);
    if (newMenu.items.find((item) => item.itemId === numericItemId)) {
      return; // Item already exists
    }

    const newItem = {
      itemId: numericItemId,
      quantity: 1,
      extraPrice: 0,
      isOptional: false,
    };

    setNewMenu((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Helper function to remove item from menu
  const removeItemFromMenu = (itemId) => {
    setNewMenu((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.itemId !== itemId),
    }));
  };

  // Helper function to update menu item
  const updateMenuItem = (itemId, field, value) => {
    setNewMenu((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              [field]:
                field === "isOptional"
                  ? value
                  : field === "quantity"
                  ? parseInt(value) || 1
                  : parseFloat(value) || 0,
            }
          : item
      ),
    }));
  };

  const updateNewMenuField = (field, value) => {
    setNewMenu((prev) => ({ ...prev, [field]: value }));
    clearErrors(field);
  };

  const addTag = () => {
    if (newTag.trim() && newMenu.tags.length < 10 && newTag.length <= 30) {
      if (!newMenu.tags.includes(newTag.trim())) {
        setNewMenu((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()],
        }));
      }
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setNewMenu((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addImage = () => {
    if (newImage.trim() && newMenu.images.length < 5) {
      try {
        new URL(newImage.trim()); // Validate URL
        if (!newMenu.images.includes(newImage.trim())) {
          setNewMenu((prev) => ({
            ...prev,
            images: [...prev.images, newImage.trim()],
          }));
        }
        setNewImage("");
      } catch {
        setCreateError("Please enter a valid image URL");
      }
    }
  };

  const removeImage = (imageToRemove) => {
    setNewMenu((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageToRemove),
    }));
  };

  const handleCreateMenu = async () => {
    // Clear previous errors
    setFieldErrors({});
    setCreateError("");

    // Client-side validation
    const validationErrors = validateForm(newMenu);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setActionLoading(true);

    try {
      const menuData = {
        name: newMenu.name.trim(),
        description: newMenu.description.trim(),
        price: parseFloat(newMenu.price),
        originalPrice: newMenu.originalPrice
          ? parseFloat(newMenu.originalPrice)
          : undefined,
        preparationTime: parseInt(newMenu.preparationTime) || 20,
        images: newMenu.images,
        tags: newMenu.tags,
        validFrom: newMenu.validFrom || undefined,
        validUntil: newMenu.validUntil || undefined,
        sortOrder: parseInt(newMenu.sortOrder) || 0,
        items: newMenu.items,
      };

      const response = await restaurantAPI.createMenu(menuData);
      onMenuCreated(response.menu);
      closeModal();
    } catch (error) {
      console.error("Error creating menu:", error);

      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle Joi validation errors
        if (errorData.details) {
          const validationErrors = {};
          errorData.details.forEach((detail) => {
            const fieldName = detail.path[0];
            validationErrors[fieldName] = detail.message;
          });
          setFieldErrors(validationErrors);
          setCreateError("Please fix the validation errors below");
        }
        // Handle custom field errors
        else if (errorData.fieldErrors) {
          setFieldErrors(errorData.fieldErrors);
          setCreateError(
            errorData.message || "Please fix the highlighted errors"
          );
        }

        // Handle general errors
        else {
          setCreateError(
            errorData.message || errorData.error || "Failed to create menu"
          );
        }
      } else if (error.message) {
        // Handle API errors that don't have response.data
        if (error.message.includes("Validation Error")) {
          setCreateError(
            "Validation failed. Please check your input and try again."
          );
        } else {
          setCreateError(error.message);
        }
      } else {
        setCreateError(
          "Network error. Please check your connection and try again."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setNewMenu({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      preparationTime: "20",
      images: [],
      tags: [],
      validFrom: "",
      validUntil: "",
      sortOrder: "0",
      items: [],
      isAutoPricing: true,
    });
    setFieldErrors({});
    setCreateError("");
    setNewTag("");
    setNewImage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      title="Create New Menu"
      subtitle="Add a new menu item to your restaurant"
      onClose={closeModal}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Menu Name" required error={fieldErrors.name}>
            <input
              type="text"
              value={newMenu.name}
              onChange={(e) => updateNewMenuField("name", e.target.value)}
              className="form-input"
              placeholder="e.g., Combo Meal, Special Dish"
              maxLength={100}
            />
          </FormField>

          <FormField
            label="Preparation Time"
            error={fieldErrors.preparationTime}
          >
            <div className="relative">
              <input
                type="number"
                min="10"
                max="120"
                value={newMenu.preparationTime}
                onChange={(e) =>
                  updateNewMenuField("preparationTime", e.target.value)
                }
                className="form-input"
                placeholder="20"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                min
              </span>
            </div>
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description" error={fieldErrors.description}>
          <textarea
            value={newMenu.description}
            onChange={(e) => updateNewMenuField("description", e.target.value)}
            className="form-textarea"
            rows="3"
            placeholder="Brief description of this menu..."
            maxLength={1000}
          />
        </FormField>

        {/* Menu Items Selection */}
        <FormField label="Menu Items" error={fieldErrors.items}>
          <div className="space-y-4">
            {/* Loading State for Items */}
            {itemsLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">
                  Loading available items...
                </span>
              </div>
            )}

            {/* No Items Available */}
            {!itemsLoading && availableItems.length === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-2">🧩</div>
                <p className="text-gray-600 font-medium">No items available</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create some base items first, then you can compose them into
                  menu items.
                </p>
                <div className="mt-3 space-x-2">
                  <button
                    type="button"
                    onClick={onRetryLoadItems}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                  >
                    Retry Loading
                  </button>
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/items")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Go to Items
                  </button>
                </div>
              </div>
            )}

            {/* Add Item Dropdown */}
            {!itemsLoading && availableItems.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="form-select flex-1"
                  onChange={(e) => {
                    if (e.target.value) {
                      addItemToMenu(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  disabled={newMenu.items.length >= 20}
                >
                  <option value="">Select an item to add</option>
                  {availableItems
                    .filter(
                      (item) =>
                        !newMenu.items.find((mi) => mi.itemId === item.id)
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}{" "}
                        {item.category?.name ? `(${item.category.name})` : ""}{" "}
                        {item.price
                          ? `- $${parseFloat(item.price).toFixed(2)}`
                          : ""}
                      </option>
                    ))}
                </select>
                <div className="text-sm text-gray-500 self-center">
                  {newMenu.items.length}/20
                </div>
              </div>
            )}

            {/* Available Items Count */}
            {!itemsLoading && availableItems.length > 0 && (
              <div className="text-sm text-gray-600">
                {
                  availableItems.filter(
                    (item) => !newMenu.items.find((mi) => mi.itemId === item.id)
                  ).length
                }{" "}
                items available to add
              </div>
            )}

            {/* Selected Items List */}
            {newMenu.items.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">
                  Selected Items ({newMenu.items.length})
                </h4>
                <p className="text-sm text-gray-600">
                  These base items will be combined to create this menu item.
                  The total price will be calculated automatically.
                </p>
                {newMenu.items.map((menuItem, index) => (
                  <div
                    key={menuItem.itemId}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-medium text-gray-900">
                          {getItemName(menuItem.itemId)}
                        </span>
                        {availableItems.find(
                          (item) => item.id === menuItem.itemId
                        )?.category?.name && (
                          <span className="text-sm text-gray-500 ml-2">
                            (
                            {
                              availableItems.find(
                                (item) => item.id === menuItem.itemId
                              )?.category?.name
                            }
                            )
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Base price: $
                          {availableItems.find(
                            (item) => item.id === menuItem.itemId
                          )?.price || "0.00"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItemFromMenu(menuItem.itemId)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove item"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={menuItem.quantity}
                          onChange={(e) =>
                            updateMenuItem(
                              menuItem.itemId,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="form-input text-sm"
                          placeholder="1"
                        />
                        {fieldErrors[`items.${index}.quantity`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {fieldErrors[`items.${index}.quantity`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Extra Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={menuItem.extraPrice}
                          onChange={(e) =>
                            updateMenuItem(
                              menuItem.itemId,
                              "extraPrice",
                              e.target.value
                            )
                          }
                          className="form-input text-sm"
                          placeholder="0.00"
                        />
                        {fieldErrors[`items.${index}.extraPrice`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {fieldErrors[`items.${index}.extraPrice`]}
                          </p>
                        )}
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={menuItem.isOptional}
                            onChange={(e) =>
                              updateMenuItem(
                                menuItem.itemId,
                                "isOptional",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-xs text-gray-700">
                            Optional
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Price Calculation Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">
                    Price Calculation
                  </h5>
                  <div className="space-y-1 text-xs text-blue-800">
                    {newMenu.items.map((menuItem) => {
                      const item = availableItems.find(
                        (item) => item.id === menuItem.itemId
                      );
                      const basePrice = item?.price || 0;
                      const quantity = menuItem.quantity || 1;
                      const extraPrice = parseFloat(menuItem.extraPrice) || 0;
                      const itemTotal = basePrice * quantity + extraPrice;

                      return (
                        <div
                          key={menuItem.itemId}
                          className="flex justify-between"
                        >
                          <span>
                            {getItemName(menuItem.itemId)}
                            {quantity > 1 && ` x${quantity}`}
                            {extraPrice > 0 && ` (+${extraPrice.toFixed(2)})`}
                          </span>
                          <span>${itemTotal.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-blue-300 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Menu Price:</span>
                        <span>
                          ${calculatePriceFromItems(newMenu.items).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State for Selected Items */}
            {!itemsLoading &&
              availableItems.length > 0 &&
              newMenu.items.length === 0 && (
                <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    Select base items from the dropdown above to compose your
                    menu item.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    For example: Select "Pasta", "Tomato Sauce", and "Cheese" to
                    create "Spaghetti Marinara"
                  </p>
                </div>
              )}
          </div>
        </FormField>

        {/* Pricing Options */}
        <div className="space-y-4">
          {/* Auto-pricing toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Auto-calculate Price
              </h4>
              <p className="text-xs text-gray-600">
                Automatically calculate price from selected items
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newMenu.isAutoPricing}
                onChange={(e) =>
                  updateNewMenuField("isAutoPricing", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Pricing Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Price"
              required={!newMenu.isAutoPricing}
              error={fieldErrors.price}
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  value={newMenu.price}
                  onChange={(e) => updateNewMenuField("price", e.target.value)}
                  className={`form-input pl-8 ${
                    newMenu.isAutoPricing
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="0.00"
                  disabled={newMenu.isAutoPricing}
                  readOnly={newMenu.isAutoPricing}
                />
              </div>
              {newMenu.isAutoPricing && (
                <p className="text-xs text-gray-500 mt-1">
                  Price is automatically calculated from selected items
                </p>
              )}
            </FormField>

            <FormField label="Original Price" error={fieldErrors.originalPrice}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1000"
                  value={newMenu.originalPrice}
                  onChange={(e) =>
                    updateNewMenuField("originalPrice", e.target.value)
                  }
                  className="form-input pl-8"
                  placeholder="0.00"
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Validity Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Valid From" error={fieldErrors.validFrom}>
            <input
              type="date"
              value={newMenu.validFrom}
              onChange={(e) => updateNewMenuField("validFrom", e.target.value)}
              className="form-input"
            />
          </FormField>

          <FormField label="Valid Until" error={fieldErrors.validUntil}>
            <input
              type="date"
              value={newMenu.validUntil}
              onChange={(e) => updateNewMenuField("validUntil", e.target.value)}
              className="form-input"
              min={newMenu.validFrom}
            />
          </FormField>
        </div>

        {/* Sort Order */}
        <FormField label="Sort Order" error={fieldErrors.sortOrder}>
          <input
            type="number"
            min="0"
            value={newMenu.sortOrder}
            onChange={(e) => updateNewMenuField("sortOrder", e.target.value)}
            className="form-input"
            placeholder="0"
          />
        </FormField>

        {/* Tags */}
        <FormField label="Tags" error={fieldErrors.tags}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="form-input flex-1"
                placeholder="Add a tag..."
                maxLength={30}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || newMenu.tags.length >= 10}
                className="btn-primary px-4"
              >
                Add
              </button>
            </div>
            {newMenu.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newMenu.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {newMenu.tags.length}/10 tags (max 30 characters each)
            </p>
          </div>
        </FormField>

        {/* Images */}
        <FormField label="Images" error={fieldErrors.images}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="form-input flex-1"
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => e.key === "Enter" && addImage()}
              />
              <button
                type="button"
                onClick={addImage}
                disabled={!newImage.trim() || newMenu.images.length >= 5}
                className="btn-primary px-4"
              >
                Add
              </button>
            </div>
            {newMenu.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {newMenu.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group border rounded-lg p-2 bg-gray-50"
                  >
                    <img
                      src={image}
                      alt={`Menu image ${index + 1}`}
                      className="w-full h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden w-full h-16 bg-gray-200 rounded items-center justify-center text-gray-500 text-sm">
                      Invalid image
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {newMenu.images.length}/5 images
            </p>
          </div>
        </FormField>
      </div>

      {/* Error Display */}
      <FormError createError={createError} fieldErrors={fieldErrors} />

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={closeModal}
          disabled={actionLoading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateMenu}
          disabled={
            actionLoading ||
            !newMenu.name.trim() ||
            (!newMenu.isAutoPricing && !newMenu.price)
          }
          className="btn-primary flex-1"
        >
          {actionLoading ? (
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
          ) : (
            "Create Menu"
          )}
        </button>
      </div>
    </ModalWrapper>
  );
}
