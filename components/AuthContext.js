"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cookie configuration
  const COOKIE_OPTIONS = {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production", // Only secure in production
    sameSite: "strict",
    path: "/",
  };

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = Cookies.get("authToken");
    const storedUser = Cookies.get("userData");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid cookies
        Cookies.remove("authToken");
        Cookies.remove("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = (loginResponse) => {
    const { user, token } = loginResponse;

    // Store in cookies
    Cookies.set("authToken", token, COOKIE_OPTIONS);
    Cookies.set("userData", JSON.stringify(user), COOKIE_OPTIONS);

    // Update state
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    // Clear cookies
    Cookies.remove("authToken");
    Cookies.remove("userData");

    // Clear state
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    Cookies.set("userData", JSON.stringify(newUserData), COOKIE_OPTIONS);
  };

  const refreshToken = (newToken) => {
    setToken(newToken);
    Cookies.set("authToken", newToken, COOKIE_OPTIONS);
  };

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshToken,
    // Helper getters for easy access
    userType: user?.userType || "end_user",
    userName: user?.firstName || user?.email?.split("@")[0] || "User",
    userEmail: user?.email,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
