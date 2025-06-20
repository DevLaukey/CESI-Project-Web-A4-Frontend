import { createRestaurantData } from "@/types/restaurant";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_USER;
const API_BASE_URL_RESTAURANT = process.env.NEXT_PUBLIC_API_URL_RESTAURANT;
const API_BASE_URL_DRIVER = process.env.NEXT_PUBLIC_API_URL_DRIVER;

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: "strict",
  path: "/",
};

// Get token from cookies
const getToken = () => {
  return Cookies.get("authToken");
};

// Get user data from cookies
const getUserData = () => {
  const userData = Cookies.get("userData");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data from cookies:", error);
      return null;
    }
  }
  return null;
};

// Get user UUID from cookies
const getUserId = () => {
  const userData = getUserData();
  return userData?.uuid  || null;
};

// Set auth data in cookies
const setAuthData = (token, userData) => {
  Cookies.set("authToken", token, COOKIE_OPTIONS);
  Cookies.set("userData", JSON.stringify(userData), COOKIE_OPTIONS);
};

// Clear auth data from cookies
const clearAuthData = () => {
  Cookies.remove("authToken");
  Cookies.remove("userData");
};

// Generic API call function
const apiCall = async (endpoint, options = {}, baseUrl) => {
  const token = getToken();
  const userId = getUserId();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add user ID header if userId exists
  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  try {
    const response = await fetch(
      `${baseUrl}${endpoint}`,
      config
    );

    console.log("Response from API:", {
      url: `${baseUrl}${endpoint}`,
      status: response.status,
      headers: response.headers,
      options: config,
    }, response);

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthData();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please login again.");
      }

      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Server-side API call function (for middleware or server components)
export const serverApiCall = async (endpoint, options = {}, request = null) => {
  let token = null;
  let userId = null;

  // Extract token and user data from request cookies if available (for middleware)
  if (request && request.cookies) {
    token = request.cookies.get("authToken")?.value;
    const userDataCookie = request.cookies.get("userData")?.value;

    if (userDataCookie) {
      try {
        const userData = JSON.parse(userDataCookie);
        userId = userData?.uuid || userData?.id || null;
      } catch (error) {
        console.error("Error parsing user data from server cookies:", error);
      }
    }
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add user ID header if userId exists
  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Server API Error:", error);
    throw error;
  }
};

// Enhanced Auth API calls with cookie management
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiCall(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        },
        API_BASE_URL
      );

      // If login is successful, store auth data in cookies
      if (response.token && response.user) {
        setAuthData(response.token, response.user);
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiCall(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(userData),
        },
        API_BASE_URL
      );

      // If registration is successful and includes login, store auth data
      if (response.token && response.user) {
        setAuthData(response.token, response.user);
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call logout API
      await apiCall(
        "/api/auth/logout",
        {
          method: "POST",
        },
        API_BASE_URL
      );
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear auth data locally
      clearAuthData();
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiCall(
        "/api/auth/refresh",
        {
          method: "POST",
        },
        API_BASE_URL
      );

      // Update token in cookies if refresh is successful
      if (response.token) {
        const userData = getUserData();
        if (userData) {
          setAuthData(response.token, userData);
        }
      }

      return response;
    } catch (error) {
      console.error("Token refresh error:", error);
      // Clear auth data if refresh fails
      clearAuthData();
      throw error;
    }
  },

  getProfile: () => apiCall("/api/auth/profile", {}, API_BASE_URL),

  updateProfile: async (userData) => {
    try {
      const response = await apiCall(
        "/api/auth/profile",
        {
          method: "PUT",
          body: JSON.stringify(userData),
        },
        API_BASE_URL
      );

      // Update user data in cookies if update is successful
      if (response.user) {
        const token = getToken();
        if (token) {
          setAuthData(token, response.user);
        }
      }

      return response;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  },

  verifyToken: () =>
    apiCall(
      "/api/auth/verify",
      {
        method: "POST",
      },
      API_BASE_URL
    ),
};

// Restaurant API calls
export const  restaurantAPI = {
  createRestaurantData: (profileData) =>
    apiCall(
      "/api/restaurants",
      {
        method: "POST",
        body: JSON.stringify(profileData),
      },
      API_BASE_URL_RESTAURANT
    ),
  updateProfile: (profileData) =>
    apiCall(
      "/api/restaurant/profile",
      {
        method: "PATCH",
        body: JSON.stringify(profileData),
      },
      API_BASE_URL_RESTAURANT
    ),
  getOrders: () =>
    apiCall("/api/restaurant/orders", {}, API_BASE_URL_RESTAURANT),
  updateOrderStatus: (orderId, status) =>
    apiCall(
      `/api/restaurant/orders/${orderId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
      API_BASE_URL_RESTAURANT
    ),
  getMenu: () => apiCall("/api/restaurant/menu", {}, API_BASE_URL_RESTAURANT),
  addMenuItem: (item) =>
    apiCall(
      "/api/items",
      {
        method: "POST",
        body: JSON.stringify(item),
      },
      API_BASE_URL_RESTAURANT
    ),
  getMenuItem: (itemId) =>
    apiCall('/api/items/owner/restaurant', {
      method: "GET"    }, API_BASE_URL_RESTAURANT),
  updateMenuItem: (itemId, item) =>
    apiCall(
      `/api/items/${itemId}`,
      {
        method: "PUT",
        body: JSON.stringify(item),
      },
      API_BASE_URL_RESTAURANT
    ),
  deleteMenuItem: (itemId) =>
    apiCall(
      `/api/items/${itemId}`,
      {
        method: "DELETE",
      },
      API_BASE_URL_RESTAURANT
    ),
  getDashboardStats: () =>
    apiCall("/api/restaurant/dashboard", {}, API_BASE_URL_RESTAURANT),
  getOwnerRestaurant: async () => {
    return apiCall("/api/restaurants/owner/me", {
      method : "GET"
    }, API_BASE_URL_RESTAURANT);
  },
 getOwnerRestaurant: async () => {
    return apiCall("/api/restaurants/owner/me", {
      method : "GET"
    }, API_BASE_URL_RESTAURANT);
  },
};

// Driver API calls
export const driverAPI = {
  getAvailableDeliveries: () =>
    apiCall("/api/driver/deliveries/available", {}, API_BASE_URL_DRIVER),
  acceptDelivery: (deliveryId) =>
    apiCall(
      `/api/driver/deliveries/${deliveryId}/accept`,
      {
        method: "POST",
      },
      API_BASE_URL_DRIVER
    ),
  updateDeliveryStatus: (deliveryId, status) =>
    apiCall(
      `/api/driver/deliveries/${deliveryId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
      API_BASE_URL_DRIVER
    ),
  getEarnings: () => apiCall("/api/driver/earnings", {}, API_BASE_URL_DRIVER),
  updateLocation: (latitude, longitude) =>
    apiCall(
      "/api/driver/location",
      {
        method: "PUT",
        body: JSON.stringify({ latitude, longitude }),
      },
      API_BASE_URL_DRIVER
    ),
  setAvailability: (isAvailable) =>
    apiCall(
      "/api/driver/availability",
      {
        method: "PUT",
        body: JSON.stringify({ isAvailable }),
      },
      API_BASE_URL_DRIVER
    ),
};

// Customer API calls
export const customerAPI = {
  getRestaurants: () => apiCall("/api/restaurants", {}, API_BASE_URL),
  getRestaurantMenu: (restaurantId) =>
    apiCall(`/api/restaurants/${restaurantId}/menu`, {}, API_BASE_URL),
  placeOrder: (orderData) =>
    apiCall(
      "/api/orders",
      {
        method: "POST",
        body: JSON.stringify(orderData),
      },
      API_BASE_URL
    ),
  getOrderHistory: () => apiCall("/api/orders/history", {}, API_BASE_URL),
  getOrderStatus: (orderId) =>
    apiCall(`/api/orders/${orderId}`, {}, API_BASE_URL),
  cancelOrder: (orderId) =>
    apiCall(
      `/api/orders/${orderId}/cancel`,
      {
        method: "PUT",
      },
      API_BASE_URL
    ),
};

// Export helper functions for external use
export { getToken, setAuthData, clearAuthData, getUserData, getUserId };

export default apiCall;
