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
const apiCall = async (endpoint, options = {}, baseUrl = API_BASE_URL) => {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);

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

  // Extract token from request cookies if available (for middleware)
  if (request && request.cookies) {
    token = request.cookies.get("authToken")?.value;
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
      const response = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }, API_BASE_URL);

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
      const response = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }, API_BASE_URL);

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
      await apiCall("/api/auth/logout", {
        method: "POST",
      }, API_BASE_URL);
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
      const response = await apiCall("/api/auth/refresh", {
        method: "POST",
      }, API_BASE_URL);

      // Update token in cookies if refresh is successful
      if (response.token) {
        const userData = Cookies.get("userData");
        if (userData) {
          setAuthData(response.token, JSON.parse(userData));
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
      const response = await apiCall("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(userData),
      }, API_BASE_URL);

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
    apiCall("/api/auth/verify", {
      method: "POST",
    }, API_BASE_URL),
};

// Restaurant API calls
export const restaurantAPI = {
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
      "/api/restaurant/menu",
      {
        method: "POST",
        body: JSON.stringify(item),
      },
      API_BASE_URL_RESTAURANT
    ),
  getMenuItem: (itemId) =>
    apiCall(`/api/restaurant/menu/${itemId}`, {}, API_BASE_URL_RESTAURANT),
  updateMenuItem: (itemId, item) =>
    apiCall(
      `/api/restaurant/menu/${itemId}`,
      {
        method: "PUT",
        body: JSON.stringify(item),
      },
      API_BASE_URL_RESTAURANT
    ),
  deleteMenuItem: (itemId) =>
    apiCall(
      `/api/restaurant/menu/${itemId}`,
      {
        method: "DELETE",
      },
      API_BASE_URL_RESTAURANT
    ),
  getDashboardStats: () =>
    apiCall("/api/restaurant/dashboard", {}, API_BASE_URL_RESTAURANT),
  completeOnboarding: async (onboardingData) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add all text fields
      Object.keys(onboardingData).forEach((key) => {
        if (key === "profilePicture" || key === "businessLicenseFile") {
          return;
        } else if (
          typeof onboardingData[key] === "object" &&
          onboardingData[key] !== null
        ) {
          formData.append(key, JSON.stringify(onboardingData[key]));
        } else if (
          onboardingData[key] !== null &&
          onboardingData[key] !== undefined
        ) {
          formData.append(key, onboardingData[key]);
        }
      });

      if (onboardingData.profilePicture) {
        formData.append("profilePicture", onboardingData.profilePicture);
      }
      if (onboardingData.businessLicenseFile) {
        formData.append(
          "businessLicenseFile",
          onboardingData.businessLicenseFile
        );
      }

      const response = await fetch(
        `${API_BASE_URL_RESTAURANT}/restaurants`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
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

      if (data.user) {
        const token = getToken();
        if (token) {
          setAuthData(token, data.user);
        }
      }

      return data;
    } catch (error) {
      console.error("Restaurant onboarding error:", error);
      throw error;
    }
  },
  getOwnerRestaurant: async () => {
    apiCall("/api/restaurants/owner/me", {}, API_BASE_URL_RESTAURANT)
  },
};

// Driver API calls
export const driverAPI = {
  getAvailableDeliveries: () => apiCall("/driver/deliveries/available"),
  acceptDelivery: (deliveryId) =>
    apiCall(`/driver/deliveries/${deliveryId}/accept`, {
      method: "POST",
    }),
  updateDeliveryStatus: (deliveryId, status) =>
    apiCall(`/driver/deliveries/${deliveryId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  getEarnings: () => apiCall("/driver/earnings"),
  updateLocation: (latitude, longitude) =>
    apiCall("/driver/location", {
      method: "PUT",
      body: JSON.stringify({ latitude, longitude }),
    }),
  setAvailability: (isAvailable) =>
    apiCall("/driver/availability", {
      method: "PUT",
      body: JSON.stringify({ isAvailable }),
    }),
};

// Customer API calls
export const customerAPI = {
  getRestaurants: () => apiCall("/restaurants"),
  getRestaurantMenu: (restaurantId) =>
    apiCall(`/restaurants/${restaurantId}/menu`),
  placeOrder: (orderData) =>
    apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  getOrderHistory: () => apiCall("/orders/history"),
  getOrderStatus: (orderId) => apiCall(`/orders/${orderId}`),
  cancelOrder: (orderId) =>
    apiCall(`/orders/${orderId}/cancel`, {
      method: "PUT",
    }),
};

// Export helper functions for external use
export { getToken, setAuthData, clearAuthData };

export default apiCall;
