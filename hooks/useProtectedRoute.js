"use client";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useProtectedRoute(options = {}) {
  const {
    allowedUserTypes = [],
    requireAuth = true,
    redirectTo = "/login",
    onUnauthorized = null,
  } = options;

  const { isAuthenticated, userType, loading, user } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authStatus, setAuthStatus] = useState("checking"); // 'checking', 'authorized', 'unauthorized', 'forbidden'

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        setAuthStatus("unauthorized");
        setIsAuthorized(false);

        if (onUnauthorized) {
          onUnauthorized("unauthorized");
        } else {
          const currentPath = window.location.pathname;
          const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(
            currentPath
          )}`;
          router.push(loginUrl);
        }
        return;
      }

      // If specific user types are required
      if (isAuthenticated && allowedUserTypes.length > 0) {
        if (!allowedUserTypes.includes(userType)) {
          setAuthStatus("forbidden");
          setIsAuthorized(false);

          if (onUnauthorized) {
            onUnauthorized("forbidden");
          } else {
            // Redirect based on user type
            switch (userType) {
              case "restaurant_owner":
                router.push("/restaurant");
                break;
              case "delivery_driver":
                router.push("/delivery");
                break;
              case "admin":
                router.push("/admin");
                break;
              default:
                router.push("/");
                break;
            }
          }
          return;
        }
      }

      // User is authorized
      setAuthStatus("authorized");
      setIsAuthorized(true);
    }
  }, [
    isAuthenticated,
    userType,
    loading,
    allowedUserTypes,
    requireAuth,
    redirectTo,
    router,
    onUnauthorized,
  ]);

  return {
    isAuthorized,
    authStatus,
    loading,
    user,
    userType,
    isAuthenticated,
  };
}

// Specific hooks for different user types
export function useRestaurantRoute() {
  return useProtectedRoute({
    allowedUserTypes: ["restaurant_owner"],
    requireAuth: true,
  });
}

export function useDriverRoute() {
  return useProtectedRoute({
    allowedUserTypes: ["delivery_driver"],
    requireAuth: true,
  });
}

export function useCustomerRoute() {
  return useProtectedRoute({
    allowedUserTypes: ["end_user"],
    requireAuth: true,
  });
}

export function useAdminRoute() {
  return useProtectedRoute({
    allowedUserTypes: ["admin"],
    requireAuth: true,
  });
}

export function useAuthenticatedRoute() {
  return useProtectedRoute({
    requireAuth: true,
  });
}
