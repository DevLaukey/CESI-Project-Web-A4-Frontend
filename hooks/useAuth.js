import { useState, useEffect, useContext, createContext } from "react";
import { auth } from "../lib/auth";
import { createUserData } from "../types/user";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (auth.isAuthenticated()) {
        const userData = await auth.getCurrentUser();
        if (userData) {
          setUser(createUserData(userData));
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      auth.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await auth.login(credentials);
    if (response.user) {
      const userData = createUserData(response.user);
      setUser(userData);
      setIsAuthenticated(true);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await auth.register(userData);
    return response;
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedData) => {
    setUser(createUserData({ ...user, ...updatedData }));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
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
