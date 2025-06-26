"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
  LOAD_CART: "LOAD_CART",
  ADD_ITEM: "ADD_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_CART: "CLEAR_CART",
  UPDATE_RESTAURANT: "UPDATE_RESTAURANT",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_SYNCING: "SET_SYNCING",
};

// Initial state
const initialState = {
  items: [],
  restaurant: null,
  total: 0.0,
  subtotal: 0.0,
  deliveryFee: 0.0,
  tax: 0.0,
  itemCount: 0,
  isLoading: false,
  isSyncing: false,
  error: null,
  cartId: null,
};

// Helper function to safely parse float values
const parseFloatSafe = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === "")
    return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to round to 2 decimal places
const roundToTwo = (num) => {
  return Math.round((parseFloatSafe(num) + Number.EPSILON) * 100) / 100;
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        // Ensure all numeric values are properly parsed
        total: parseFloatSafe(action.payload.total),
        subtotal: parseFloatSafe(action.payload.subtotal),
        deliveryFee: parseFloatSafe(action.payload.deliveryFee),
        tax: parseFloatSafe(action.payload.tax),
        itemCount: parseInt(action.payload.itemCount) || 0,
      };

    case CART_ACTIONS.ADD_ITEM: {
      const { item, size, extras } = action.payload;

      // Ensure item numeric values are properly parsed
      const normalizedItem = {
        ...item,
        basePrice: parseFloatSafe(item.basePrice || item.price),
        price: parseFloatSafe(item.price || item.basePrice),
        restaurantDeliveryFee: parseFloatSafe(item.restaurantDeliveryFee, 2.99),
      };

      // Normalize size and extras
      const normalizedSize = size
        ? {
            ...size,
            price: parseFloatSafe(size.price),
          }
        : null;

      const normalizedExtras = (extras || []).map((extra) => ({
        ...extra,
        price: parseFloatSafe(extra.price),
      }));

      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          cartItem.uuid === normalizedItem.uuid &&
          JSON.stringify(cartItem.size) === JSON.stringify(normalizedSize) &&
          JSON.stringify(cartItem.extras) === JSON.stringify(normalizedExtras)
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Add new item
        const newItem = {
          ...normalizedItem,
          quantity: 1,
          size: normalizedSize,
          extras: normalizedExtras,
          cartItemId:
            Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        newItems = [...state.items, newItem];
      }

      const calculations = calculateTotals(newItems, state.restaurant);
      return {
        ...state,
        items: newItems,
        ...calculations,
      };
    }

    case CART_ACTIONS.UPDATE_ITEM: {
      const { cartItemId, quantity } = action.payload;
      const parsedQuantity = parseInt(quantity) || 0;
      let newItems;

      if (parsedQuantity <= 0) {
        newItems = state.items.filter((item) => item.cartItemId !== cartItemId);
      } else {
        newItems = state.items.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: parsedQuantity }
            : item
        );
      }

      const calculations = calculateTotals(newItems, state.restaurant);
      return {
        ...state,
        items: newItems,
        ...calculations,
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(
        (item) => item.cartItemId !== action.payload
      );
      const calculations = calculateTotals(newItems, state.restaurant);
      return {
        ...state,
        items: newItems,
        ...calculations,
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState,
        restaurant: action.payload?.keepRestaurant ? state.restaurant : null,
      };

    case CART_ACTIONS.UPDATE_RESTAURANT: {
      const normalizedRestaurant = action.payload
        ? {
            ...action.payload,
            deliveryFee: parseFloatSafe(action.payload.deliveryFee, 2.99),
            minimumOrder: parseFloatSafe(action.payload.minimumOrder),
            averageDeliveryTime:
              parseInt(action.payload.averageDeliveryTime) || 30,
          }
        : null;

      return {
        ...state,
        restaurant: normalizedRestaurant,
        deliveryFee: normalizedRestaurant?.deliveryFee || 0.0,
      };
    }

    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: Boolean(action.payload),
      };

    case CART_ACTIONS.SET_SYNCING:
      return {
        ...state,
        isSyncing: Boolean(action.payload),
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isSyncing: false,
      };

    default:
      return state;
  }
};

// Calculate totals helper function with proper float parsing
const calculateTotals = (items, restaurant) => {
  const subtotal = items.reduce((sum, item) => {
    let itemPrice = parseFloatSafe(item.basePrice || item.price);

    // Add size price if applicable
    if (item.size && item.size.price) {
      itemPrice += parseFloatSafe(item.size.price);
    }

    // Add extras price
    if (item.extras && item.extras.length > 0) {
      const extrasPrice = item.extras.reduce(
        (sum, extra) => sum + parseFloatSafe(extra.price),
        0
      );
      itemPrice += extrasPrice;
    }

    return sum + itemPrice * parseInt(item.quantity || 1);
  }, 0);

  const deliveryFee = parseFloatSafe(restaurant?.deliveryFee);
  const taxRate = 0.08; // 8% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;
  const itemCount = items.reduce(
    (sum, item) => sum + parseInt(item.quantity || 1),
    0
  );

  return {
    subtotal: roundToTwo(subtotal),
    deliveryFee: roundToTwo(deliveryFee),
    tax: roundToTwo(tax),
    total: roundToTwo(total),
    itemCount,
  };
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage and server on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0 || state.restaurant) {
      const cartData = {
        items: state.items,
        restaurant: state.restaurant,
        cartId: state.cartId,
        // Include calculated totals for consistency
        subtotal: state.subtotal,
        deliveryFee: state.deliveryFee,
        tax: state.tax,
        total: state.total,
        itemCount: state.itemCount,
      };

      localStorage.setItem("foodDeliveryCart", JSON.stringify(cartData));
    } else {
      localStorage.removeItem("foodDeliveryCart");
    }
  }, [state.items, state.restaurant, state.cartId, state.total]);

  // Generate session ID for guest users
  const getSessionId = () => {
    let sessionId = localStorage.getItem("cartSessionId");
    if (!sessionId) {
      sessionId =
        "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("cartSessionId", sessionId);
    }
    return sessionId;
  };

  // API calls with Mongoose integration
  const saveCartToServer = async (cartData) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: true });

      const payload = {
        items: cartData.items,
        restaurant: cartData.restaurant,
        cartId: cartData.cartId,
        sessionId: getSessionId(),
        // Include user ID if available (for authenticated users)
        userId: null, // You can get this from auth context
      };

      const response = await fetch("/api/cart/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": getSessionId(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: false });
        return {
          cartId: result.cartId,
          totals: result.totals,
          meetsMinimumOrder: result.meetsMinimumOrder,
          minimumOrderRemaining: result.minimumOrderRemaining,
        };
      } else {
        const error = await response.json();
        console.error("Server error saving cart:", error);
        dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      }
    } catch (error) {
      console.error("Error saving cart to server:", error);
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: "Failed to sync cart",
      });
    }

    dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: false });
    return null;
  };

  const loadCartFromServer = async (cartId) => {
    try {
      const response = await fetch(`/api/cart/${cartId}`, {
        headers: {
          "x-session-id": getSessionId(),
        },
      });

      if (response.ok) {
        const result = await response.json();
        return {
          cartId: result.cartId,
          items: result.items || [],
          restaurant: result.restaurant,
          subtotal: parseFloatSafe(result.totals?.subtotal),
          deliveryFee: parseFloatSafe(result.totals?.deliveryFee),
          tax: parseFloatSafe(result.totals?.tax),
          total: parseFloatSafe(result.totals?.total),
          itemCount: parseInt(result.totals?.itemCount) || 0,
        };
      } else {
        const error = await response.json();
        console.warn("Error loading cart from server:", error);
      }
    } catch (error) {
      console.error("Error loading cart from server:", error);
    }
    return null;
  };

  // Cart actions
  const loadCart = async () => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      // First try to load from localStorage
      const localCart = localStorage.getItem("foodDeliveryCart");
      if (localCart) {
        const cartData = JSON.parse(localCart);

        // Ensure all numeric values are properly parsed
        const normalizedCartData = {
          ...cartData,
          items: (cartData.items || []).map((item) => ({
            ...item,
            basePrice: parseFloatSafe(item.basePrice || item.price),
            price: parseFloatSafe(item.price || item.basePrice),
            quantity: parseInt(item.quantity) || 1,
            size: item.size
              ? {
                  ...item.size,
                  price: parseFloatSafe(item.size.price),
                }
              : null,
            extras: (item.extras || []).map((extra) => ({
              ...extra,
              price: parseFloatSafe(extra.price),
            })),
          })),
          restaurant: cartData.restaurant
            ? {
                ...cartData.restaurant,
                deliveryFee: parseFloatSafe(
                  cartData.restaurant.deliveryFee,
                  2.99
                ),
                minimumOrder: parseFloatSafe(cartData.restaurant.minimumOrder),
              }
            : null,
        };

        // If we have a cartId, try to sync with server
        if (normalizedCartData.cartId) {
          const serverCart = await loadCartFromServer(
            normalizedCartData.cartId
          );
          if (serverCart && serverCart.items.length > 0) {
            // Use server data if available and not empty
            dispatch({
              type: CART_ACTIONS.LOAD_CART,
              payload: serverCart,
            });
            return;
          }
        }

        // Use local cart data with recalculated totals
        const calculations = calculateTotals(
          normalizedCartData.items,
          normalizedCartData.restaurant
        );

        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { ...normalizedCartData, ...calculations },
        });
      } else {
        dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: "Failed to load cart",
      });
    }
  };

  const addToCart = async (item, size = null, extras = []) => {
    // Normalize input item
    const normalizedItem = {
      ...item,
      basePrice: parseFloatSafe(item.basePrice || item.price),
      price: parseFloatSafe(item.price || item.basePrice),
      restaurantDeliveryFee: parseFloatSafe(item.restaurantDeliveryFee, 2.99),
    };

    // Check if adding item from different restaurant
    if (
      state.restaurant &&
      state.restaurant.uuid !== normalizedItem.restaurantUuid
    ) {
      const confirmSwitch = window.confirm(
        `You have items from ${
          state.restaurant.name
        } in your cart. Adding items from ${
          normalizedItem.restaurantName || "another restaurant"
        } will clear your current cart. Continue?`
      );

      if (!confirmSwitch) return false;

      // Clear cart and update restaurant
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }

    // Set restaurant if not set
    if (!state.restaurant && normalizedItem.restaurantUuid) {
      const restaurant = {
        uuid: normalizedItem.restaurantUuid,
        name: normalizedItem.restaurantName || "Restaurant",
        deliveryFee: parseFloatSafe(normalizedItem.restaurantDeliveryFee, 2.99),
      };
      dispatch({ type: CART_ACTIONS.UPDATE_RESTAURANT, payload: restaurant });
    }

    // Add item to cart
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { item: normalizedItem, size, extras },
    });

    // Save to server in background
    setTimeout(async () => {
      const cartData = {
        items: state.items,
        restaurant: state.restaurant,
        cartId: state.cartId,
      };

      const result = await saveCartToServer(cartData);
      if (result && result.cartId !== state.cartId) {
        // Update cart ID and totals from server
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            ...state,
            cartId: result.cartId,
            ...result.totals,
          },
        });
      }
    }, 500);

    return true;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const parsedQuantity = parseInt(quantity) || 0;

    dispatch({
      type: CART_ACTIONS.UPDATE_ITEM,
      payload: { cartItemId, quantity: parsedQuantity },
    });

    // Sync with server
    setTimeout(async () => {
      if (state.cartId) {
        await saveCartToServer({
          items: state.items,
          restaurant: state.restaurant,
          cartId: state.cartId,
        });
      }
    }, 300);
  };

  const removeItem = async (cartItemId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: cartItemId,
    });

    // Sync with server
    setTimeout(async () => {
      if (state.cartId) {
        await saveCartToServer({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
          restaurant: state.restaurant,
          cartId: state.cartId,
        });
      }
    }, 300);
  };

  const clearCart = async (keepRestaurant = false) => {
    dispatch({
      type: CART_ACTIONS.CLEAR_CART,
      payload: { keepRestaurant },
    });

    // Clear cart on server
    if (state.cartId) {
      try {
        await fetch(`/api/cart/${state.cartId}`, {
          method: "DELETE",
          headers: {
            "x-session-id": getSessionId(),
          },
        });
      } catch (error) {
        console.error("Error clearing cart on server:", error);
      }
    }
  };

  const updateRestaurant = (restaurant) => {
    const normalizedRestaurant = restaurant
      ? {
          ...restaurant,
          deliveryFee: parseFloatSafe(restaurant.deliveryFee, 2.99),
          minimumOrder: parseFloatSafe(restaurant.minimumOrder),
        }
      : null;

    dispatch({
      type: CART_ACTIONS.UPDATE_RESTAURANT,
      payload: normalizedRestaurant,
    });
  };

  // Check if cart meets minimum order requirement
  const meetsMinimumOrder = () => {
    if (!state.restaurant?.minimumOrder) return true;
    return state.subtotal >= parseFloatSafe(state.restaurant.minimumOrder);
  };

  // Get minimum order remaining amount
  const getMinimumOrderRemaining = () => {
    if (!state.restaurant?.minimumOrder) return 0.0;
    const remaining =
      parseFloatSafe(state.restaurant.minimumOrder) - state.subtotal;
    return roundToTwo(Math.max(0, remaining));
  };

  const value = {
    // State (ensure all numbers are properly typed)
    ...state,
    subtotal: parseFloatSafe(state.subtotal),
    deliveryFee: parseFloatSafe(state.deliveryFee),
    tax: parseFloatSafe(state.tax),
    total: parseFloatSafe(state.total),

    // Actions
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    updateRestaurant,
    loadCart,

    // Computed values
    meetsMinimumOrder: meetsMinimumOrder(),
    minimumOrderRemaining: getMinimumOrderRemaining(),

    // Helper functions
    parseFloatSafe,
    roundToTwo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CartContext };
