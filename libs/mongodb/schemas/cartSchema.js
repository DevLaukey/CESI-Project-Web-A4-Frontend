// libs/mongodb/schemas/cartSchema.js
import { ObjectId } from "mongodb";

// Cart Item Schema
export const CartItemSchema = {
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  category: { type: String },
  restaurantUuid: { type: String, required: true },
  restaurantName: { type: String },
  restaurantDeliveryFee: { type: Number },

  // Optional fields for variations
  size: {
    name: { type: String },
    price: { type: Number, default: 0 },
  },
  extras: [
    {
      name: { type: String },
      price: { type: Number, default: 0 },
    },
  ],

  // Item properties
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isSpicy: { type: Boolean, default: false },
  spicyLevel: { type: Number, default: 0 },
  allergens: [{ type: String }],
  preparationTime: { type: Number },

  // Cart specific
  cartItemId: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
};

// Restaurant Info Schema (minimal for cart)
export const CartRestaurantSchema = {
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  deliveryFee: { type: Number, required: true },
  minimumOrder: { type: Number, default: 0 },
  averageDeliveryTime: { type: Number, default: 30 },
  isOpen: { type: Boolean, default: true },
};

// Main Cart Schema
export const CartSchema = {
  _id: { type: ObjectId },

  // Cart contents
  items: [CartItemSchema],
  restaurant: CartRestaurantSchema,

  // User identification
  userId: { type: String, default: null }, // For authenticated users
  sessionId: { type: String, default: null }, // For guest users

  // Cart metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },

  // Cart state
  status: {
    type: String,
    enum: ["active", "checkout", "completed", "abandoned"],
    default: "active",
  },

  // Calculated fields (stored for performance)
  totals: {
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 },
  },
};

// Database indexes for performance
export const CartIndexes = [
  { userId: 1, status: 1 },
  { sessionId: 1, status: 1 },
  { expiresAt: 1 }, // TTL index for automatic cleanup
  { "restaurant.uuid": 1 },
  { createdAt: -1 },
  { updatedAt: -1 },
];

// Validation functions
export const validateCartItem = (item) => {
  const errors = [];

  if (!item.uuid) errors.push("Item UUID is required");
  if (!item.name) errors.push("Item name is required");
  if (!item.basePrice || item.basePrice < 0)
    errors.push("Valid base price is required");
  if (!item.quantity || item.quantity < 1)
    errors.push("Valid quantity is required");
  if (!item.restaurantUuid) errors.push("Restaurant UUID is required");
  if (!item.cartItemId) errors.push("Cart item ID is required");

  return errors;
};

export const validateCartRestaurant = (restaurant) => {
  const errors = [];

  if (!restaurant.uuid) errors.push("Restaurant UUID is required");
  if (!restaurant.name) errors.push("Restaurant name is required");
  if (restaurant.deliveryFee === undefined || restaurant.deliveryFee < 0) {
    errors.push("Valid delivery fee is required");
  }

  return errors;
};

export const validateCart = (cart) => {
  const errors = [];

  if (!cart.items || !Array.isArray(cart.items)) {
    errors.push("Cart items must be an array");
  } else {
    cart.items.forEach((item, index) => {
      const itemErrors = validateCartItem(item);
      if (itemErrors.length > 0) {
        errors.push(`Item ${index + 1}: ${itemErrors.join(", ")}`);
      }
    });
  }

  if (cart.restaurant) {
    const restaurantErrors = validateCartRestaurant(cart.restaurant);
    if (restaurantErrors.length > 0) {
      errors.push(`Restaurant: ${restaurantErrors.join(", ")}`);
    }
  }

  if (!cart.expiresAt) {
    errors.push("Expiration date is required");
  }

  return errors;
};

// Helper functions for cart calculations
export const calculateCartTotals = (items, restaurant) => {
  const subtotal = items.reduce((sum, item) => {
    let itemPrice = item.basePrice || item.price || 0;

    // Add size price if applicable
    if (item.size && item.size.price) {
      itemPrice += item.size.price;
    }

    // Add extras price
    if (item.extras && item.extras.length > 0) {
      const extrasPrice = item.extras.reduce(
        (sum, extra) => sum + (extra.price || 0),
        0
      );
      itemPrice += extrasPrice;
    }

    return sum + itemPrice * item.quantity;
  }, 0);

  const deliveryFee = restaurant?.deliveryFee || 0;
  const taxRate = 0.08; // 8% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    itemCount,
  };
};

// Database setup function
export const setupCartCollection = async (db) => {
  const cartsCollection = db.collection("carts");

  // Create indexes
  for (const index of CartIndexes) {
    try {
      await cartsCollection.createIndex(index);
    } catch (error) {
      console.warn("Index creation warning:", error.message);
    }
  }

  // Create TTL index for automatic cleanup
  try {
    await cartsCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );
  } catch (error) {
    console.warn("TTL index creation warning:", error.message);
  }

  console.log("Cart collection setup completed");
};
