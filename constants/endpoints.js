export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/register",
    LOGIN: "/login",
    LOGOUT: "/logout",
    PROFILE: "/user/profile",
  },
  RESTAURANTS: {
    LIST: "/restaurants",
    DETAIL: (id) => `/restaurants/${id}`,
    MENU: (id) => `/restaurants/${id}/menu`,
    SEARCH: "/restaurants/search",
  },
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    DETAIL: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
};

export const USER_TYPES = {
  END_USER: "end_user",
  RESTAURANT_OWNER: "restaurant_owner",
  DELIVERY_DRIVER: "delivery_driver",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};
