// lib/api.js - Global API configuration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/logout",

  // User endpoints
  USER_PROFILE: "/api/user/profile",
  UPDATE_PROFILE: "/api/user/update",

  // Location endpoints
  GEOCODE: "/api/location/geocode",
  REVERSE_GEOCODE: "/api/location/reverse-geocode",

  // Restaurant endpoints
  RESTAURANTS: "/api/restaurants",
  RESTAURANT_DETAILS: "/api/restaurants",
  MENU_ITEMS: "/api/menu",

  // Order endpoints
  CREATE_ORDER: "/api/orders",
  ORDER_HISTORY: "/api/orders/history",
  ORDER_STATUS: "/api/orders/status",

  // Cart endpoints
  CART: "/api/cart",
  ADD_TO_CART: "/api/cart/add",
  UPDATE_CART: "/api/cart/update",
  REMOVE_FROM_CART: "/api/cart/remove",

  // Rider endpoints
  RIDER_REGISTER: "/api/rider/register",
  RIDER_PROFILE: "/api/rider/profile",

  // Partner endpoints
  PARTNER_REGISTER: "/api/partner/register",
  PARTNER_PROFILE: "/api/partner/profile",
};

// HTTP methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

// Default headers
const defaultHeaders = {
  "Content-Type": "application/json",
};

// API client class
class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  // Set authentication token
  setAuthToken(token) {
    this.token = token;
  }

  // Get headers with auth token if available
  getHeaders(customHeaders = {}) {
    const headers = { ...defaultHeaders, ...customHeaders };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: options.method || HTTP_METHODS.GET,
      headers: this.getHeaders(options.headers),
      ...options,
    };

    // Add body for non-GET requests
    if (options.data && config.method !== HTTP_METHODS.GET) {
      config.body = JSON.stringify(options.data);
    }

    try {
      const response = await fetch(url, config);

      // Handle different response types
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data
        );
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Network error: ${error.message}`, 0, error);
    }
  }

  // Convenience methods for different HTTP verbs
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { ...options, method: HTTP_METHODS.GET });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.POST,
      data,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.PUT,
      data,
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.PATCH,
      data,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.DELETE,
    });
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Create and export the API client instance
export const api = new ApiClient();

export const authAPI = {
  register: async (userData) => {
    return api.post(API_ENDPOINTS.REGISTER, userData);
  },

  login: async (credentials) => {
    return api.post(API_ENDPOINTS.LOGIN, credentials);
  },

  logout: async () => {
    return api.post(API_ENDPOINTS.LOGOUT);
  },
};

// User-specific API functions
export const userAPI = {
  getProfile: async () => {
    return api.get(API_ENDPOINTS.USER_PROFILE);
  },

  updateProfile: async (userData) => {
    return api.patch(API_ENDPOINTS.UPDATE_PROFILE, userData);
  },
};

// Location-specific API functions
export const locationAPI = {
  geocode: async (address) => {
    return api.post(API_ENDPOINTS.GEOCODE, { address });
  },

  reverseGeocode: async (lat, lng) => {
    return api.post(API_ENDPOINTS.REVERSE_GEOCODE, { lat, lng });
  },
};

// Restaurant-specific API functions
export const restaurantAPI = {
  getRestaurants: async (location, filters = {}) => {
    return api.get(API_ENDPOINTS.RESTAURANTS, { location, ...filters });
  },

  getRestaurantDetails: async (restaurantId) => {
    return api.get(`${API_ENDPOINTS.RESTAURANT_DETAILS}/${restaurantId}`);
  },

  getMenuItems: async (restaurantId) => {
    return api.get(`${API_ENDPOINTS.MENU_ITEMS}/${restaurantId}`);
  },
};

// Cart-specific API functions
export const cartAPI = {
  getCart: async () => {
    return api.get(API_ENDPOINTS.CART);
  },

  addToCart: async (item) => {
    return api.post(API_ENDPOINTS.ADD_TO_CART, item);
  },

  updateCartItem: async (itemId, quantity) => {
    return api.patch(`${API_ENDPOINTS.UPDATE_CART}/${itemId}`, { quantity });
  },

  removeFromCart: async (itemId) => {
    return api.delete(`${API_ENDPOINTS.REMOVE_FROM_CART}/${itemId}`);
  },
};

// Order-specific API functions
export const orderAPI = {
  createOrder: async (orderData) => {
    return api.post(API_ENDPOINTS.CREATE_ORDER, orderData);
  },

  getOrderHistory: async () => {
    return api.get(API_ENDPOINTS.ORDER_HISTORY);
  },

  getOrderStatus: async (orderId) => {
    return api.get(`${API_ENDPOINTS.ORDER_STATUS}/${orderId}`);
  },
};

// Rider-specific API functions
export const riderAPI = {
  register: async (riderData) => {
    return api.post(API_ENDPOINTS.RIDER_REGISTER, riderData);
  },

  getProfile: async () => {
    return api.get(API_ENDPOINTS.RIDER_PROFILE);
  },
};

// Partner-specific API functions
export const partnerAPI = {
  register: async (partnerData) => {
    return api.post(API_ENDPOINTS.PARTNER_REGISTER, partnerData);
  },

  getProfile: async () => {
    return api.get(API_ENDPOINTS.PARTNER_PROFILE);
  },
};

export default api;
