import { api } from "./api";
import jwt from "jsonwebtoken";

export const auth = {
  // Check if user is authenticated
  isAuthenticated() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("authToken");
  },

  // Get stored token
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.login(credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await api.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Get current user data
  async getCurrentUser() {
    try {
      if (!this.isAuthenticated()) return null;
      const user = await api.getCurrentUser();
      return user;
    } catch (error) {
      console.error("Get user error:", error);
      // If token is invalid, clear it
      this.logout();
      return null;
    }
  },

  // Clear auth data (used on errors)
  clearAuth() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  },
};

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}
