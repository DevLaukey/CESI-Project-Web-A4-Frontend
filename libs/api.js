import { createRestaurantData } from "@/types/restaurant";
import Cookies from "js-cookie";
import { get } from "mongoose";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_USER;
const API_BASE_URL_RESTAURANT = process.env.NEXT_PUBLIC_API_URL_RESTAURANT;
const API_BASE_URL_DRIVER = process.env.NEXT_PUBLIC_API_URL_DRIVER;
const API_BASE_URL_REFERRAL = process.env.NEXT_PUBLIC_API_URL_REFERAL;

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: "strict",
  path: "/",
};

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
  return userData?.uuid || null;
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
    const response = await fetch(`${baseUrl}${endpoint}`, config);

    console.log(
      "Response from API:",
      {
        url: `${baseUrl}${endpoint}`,
        status: response.status,
        headers: response.headers,
        options: config,
      },
      response
    );

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

  getProfile: () => apiCall("/api/users/profile", {}, API_BASE_URL),

  updateProfile: async (userData) => {
    try {
      const response = await apiCall(
        "/api/users/profile",
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

  updateProfilePicture: async (formData) => {
    try {
      const response = await apiCall(
        "/api/users/profile-picture",
        {
          method: "PUT",
          body: formData,
        },
        API_BASE_URL
      );
      // Update user data in cookies if profile picture update is successful
      if (response.user) {
        const token = getToken();
        if (token) {
          setAuthData(token, response.user);
        }
      }
      return response;
    } catch (error) {
      console.error("Profile picture update error:", error);
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await apiCall(
        "/api/users/change-password",
        {
          method: "PUT",
          body: JSON.stringify(passwordData),
        },
        API_BASE_URL
      );
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      await apiCall(
        "/api/users/delete",
        {
          method: "DELETE",
        },
        API_BASE_URL
      );
      clearAuthData();
    } catch (error) {
      console.error("Account deletion error:", error);
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
export const restaurantAPI = {
  // Create restaurant data onboarding
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

  updateRestaurantProfile: (profileData) =>
    apiCall(
      "/api/restaurants/owner/me",
      {
        method: "PATCH",
        body: JSON.stringify(profileData),
      },
      API_BASE_URL_RESTAURANT
    ),

  addMenuItem: (item) =>
    apiCall(
      "/api/items",
      {
        method: "POST",
        body: JSON.stringify(item),
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
  getCategories: () => apiCall("/api/categories", {}, API_BASE_URL_RESTAURANT),
  getItems: () =>
    apiCall("/api/items/owner/restaurant", {}, API_BASE_URL_RESTAURANT),

  getMenus: () =>
    apiCall("/api/menus/owner/restaurant", {}, API_BASE_URL_RESTAURANT),
  createMenu: (item) =>
    apiCall(
      "/api/menus",
      {
        method: "POST",
        body: JSON.stringify(item),
      },
      API_BASE_URL_RESTAURANT
    ),

  addItems: (items) =>
    apiCall(
      `/api/items`,
      {
        method: "POST",
        body: JSON.stringify(items),
      },
      API_BASE_URL_RESTAURANT
    ),

  getMenuItem: (itemId) =>
    apiCall(
      "/api/items/owner/restaurant",
      {
        method: "GET",
      },
      API_BASE_URL_RESTAURANT
    ),

  getMenuItems: () =>
    apiCall("/api/items/owner/restaurant", {}, API_BASE_URL_RESTAURANT),

  updateMenuItem: (menuUUID, item) =>
    apiCall(
      `/api/menus/${menuUUID}`,
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
    return apiCall(
      "/api/restaurants/owner/me",
      {
        method: "GET",
      },
      API_BASE_URL_RESTAURANT
    );
  },
  getOwnerRestaurant: async () => {
    return apiCall(
      "/api/restaurants/owner/me",
      {
        method: "GET",
      },
      API_BASE_URL_RESTAURANT
    );
  },

  toggleRestaurantStatus: (isOpen) =>
    apiCall(
      `/api/restaurants/owner/me`,
      {
        method: "PUT",
        body: JSON.stringify({
          isOpen,
        }),
      },
      API_BASE_URL_RESTAURANT
    ),

  deleteMenu: (menuId) =>
    apiCall(
      `/api/menus/${menuId}`,
      {
        method: "DELETE",
      },
      API_BASE_URL_RESTAURANT
    ),

  deleteRestaurant: () =>
    apiCall(
      `/api/restaurants/owner/me`,
      {
        method: "DELETE",
      },
      API_BASE_URL_RESTAURANT
    ),
};

// Driver API calls
export const driverAPI = {
  createDriverProfile: (profileData) =>
    apiCall(
      "/api/drivers/register",
      {
        method: "POST",
        body: JSON.stringify(profileData),
      },
      API_BASE_URL_DRIVER
    ),

  completeDriverProfile: (profileData) =>
    apiCall(
      "/api/drivers/complete-profile",
      {
        method: "POST",
        body: JSON.stringify(profileData),
      },
      API_BASE_URL_DRIVER
    ),

  getDriverProfile: () =>
    apiCall("/api/drivers/profile", {}, API_BASE_URL_DRIVER),

  getCurrentDelivery: () =>
    apiCall("/api/driver/deliveries/current", {}, API_BASE_URL_DRIVER),

  updateDriverProfile: (profileData) =>
    apiCall(
      "/api/drivers/profile",
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      },
      API_BASE_URL_DRIVER
    ),

  getAvailableDeliveries: () =>
    apiCall("/api/drivers/deliveries/available", {}, API_BASE_URL_DRIVER),

  acceptDelivery: (deliveryId) =>
    apiCall(
      `/api/deliveries/${deliveryId}/accept`,
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

  getDeliveryHistory: (page = 1, limit = 10, status = null) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    return apiCall(
      `/api/drivers/deliveries/history?${params}`,
      {},
      API_BASE_URL_DRIVER
    );
  },

  getDriverEarnings: (startDate = null, endDate = null) => {
    const params = new URLSearchParams();

    if (startDate) {
      params.append("start_date", startDate);
    }
    if (endDate) {
      params.append("end_date", endDate);
    }

    const endpoint = params.toString()
      ? `/api/drivers/earnings?${params}`
      : "/api/drivers/earnings";
    return apiCall(endpoint, {}, API_BASE_URL_DRIVER);
  },

  getVerificationStatus: () =>
    apiCall("/api/drivers/verification-status", {}, API_BASE_URL_DRIVER),

  getVehicleInfo: () =>
    apiCall("/api/drivers/vehicle", {}, API_BASE_URL_DRIVER),

  toggleAvailability: (available) => {
    console.log("Toggling availability:", available)
    return apiCall(
      "/api/drivers/availability",
      {
        method: "PATCH",
        body: JSON.stringify({ available }),
      },
      API_BASE_URL_DRIVER
    )
  },

  updateDriverLocation: (latitude, longitude, heading = null, speed = null) => {
    const locationData = { latitude, longitude };

    if (heading !== null) {
      locationData.heading = heading;
    }
    if (speed !== null) {
      locationData.speed = speed;
    }

    return apiCall(
      "/api/drivers/location",
      {
        method: "POST",
        body: JSON.stringify(locationData),
      },
      API_BASE_URL_DRIVER
    );
  },

  rejectDelivery: async (deliveryId, reason = null) => {
    try {
      const body = reason ? { reason } : {};

      return await apiCall(
        `/api/deliveries/${deliveryId}/decline`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        API_BASE_URL_DRIVER
      );
    } catch (error) {
      // If reject endpoint doesn't exist, we can just handle it client-side
      if (
        error.message.includes("404") ||
        error.message.includes("HTTP Error 404")
      ) {
        return { success: true, message: "Delivery declined" };
      }
      throw error;
    }
  },

  completeDelivery: async (deliveryId, completionData = {}) => {
    try {
      return await apiCall(
        `/api/deliveries/${deliveryId}/complete`,
        {
          method: "POST",
          body: JSON.stringify(completionData),
        },
        API_BASE_URL_DRIVER
      );
    } catch (error) {
      // If complete endpoint doesn't exist, try updating status
      if (
        error.message.includes("404") ||
        error.message.includes("HTTP Error 404")
      ) {
        return await originalDriverAPI.updateDeliveryStatus(
          deliveryId,
          "completed"
        );
      }
      throw error;
    }
  },
};

export const formatDeliveryData = (delivery) => {
  return {
    id: delivery.id || delivery._id,
    restaurant: delivery.restaurant || { name: delivery.restaurantName },
    customer: delivery.customer || { name: delivery.customerName },
    address: delivery.deliveryAddress || delivery.address,
    distance: delivery.distance || `${(delivery.distanceKm || 0).toFixed(1)} km`,
    earnings: delivery.driverEarnings || delivery.earnings || delivery.amount,
    estimatedTime: delivery.estimatedDeliveryTime || delivery.estimatedTime || 'N/A',
    items: delivery.items?.length || delivery.itemCount || 0,
    priority: delivery.priority || 'normal',
    lat: delivery.deliveryLocation?.latitude || delivery.lat,
    lng: delivery.deliveryLocation?.longitude || delivery.lng,
    status: delivery.status,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt
  };
};

// Helper function to format driver stats
export const formatDriverStats = (stats) => {
  return {
    todayEarnings: `€${(stats.todayEarnings || 0).toFixed(2)}`,
    weeklyEarnings: `€${(stats.weeklyEarnings || stats.totalEarnings || 0).toFixed(2)}`,
    completedDeliveries: stats.completedDeliveries || stats.totalDeliveries || 0,
    averageRating: (stats.averageRating || 0).toFixed(1),
    onlineTime: formatOnlineTime(stats.onlineTime || stats.totalHours || 0)
  };
};

// Helper function to format online time
export const formatOnlineTime = (hours) => {
  if (typeof hours === 'string') return hours;
  
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${m}m`;
};

// Customer API calls
export const customerAPI = {
  getRestaurants: () =>
    apiCall("/api/restaurants", {}, API_BASE_URL_RESTAURANT),
  searchRestaurants: (queryParams) => {
    const endpoint = queryParams
      ? `/api/restaurants/search`
      : "/api/restaurants/search";
    return apiCall(endpoint, {}, API_BASE_URL);
  },

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

  getRestaurantById: async (restaurantId) => {
    return apiCall(
      `/api/restaurants/${restaurantId}`,
      {},
      API_BASE_URL_RESTAURANT
    );
  },
  getMenuItems: async (restaurantId) => {
    return apiCall(
      `/api/items/restaurant/${restaurantId}`,
      {},
      API_BASE_URL_RESTAURANT
    );
  },
  getMenu: async (restaurantId) => {
    return apiCall(`/api/menus/${restaurantId}`, {}, API_BASE_URL_RESTAURANT);
  },
};

// Referral API calls
export const referralAPI = {
  generateReferralCode: async () => {
    const res = await apiCall(
      "/api/referrals/generate",
      { method: "POST" },
      API_BASE_URL_REFERRAL
    );
    return res;
  },

  resetreferralCode: async () => {
    const res = await apiCall(
      "/api/referrals/reset",
      { method: "POST" },
      API_BASE_URL_REFERRAL
    );
    return res;
  },
  getMyReferralCode: async () => {
    const res = await apiCall("/api/referrals/my", {}, API_BASE_URL_REFERRAL);
    return res;
  },
  getwhoreferredMe: async () => {
    const res = await apiCall(
      "/api/referrals/referred-by",
      {},
      API_BASE_URL_REFERRAL
    );
    return res;
  },

  getPeopleIReferred: async () => {
    const res = await apiCall(
      "/api/referrals/referrals",
      {},
      API_BASE_URL_REFERRAL
    );
    return res;
  },

  useReferralCode: async (code) => {
    const res = await apiCall(
      "/api/referrals/use",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
      API_BASE_URL_REFERRAL
    );
    return res;
  },
};

// Export helper functions for external use
export { getToken, setAuthData, clearAuthData, getUserData, getUserId };

export default apiCall;
