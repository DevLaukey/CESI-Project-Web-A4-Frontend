"use client";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
  allowedUserTypes = [],
  requireAuth = true,
  redirectTo = "/login",
  fallbackComponent = null,
}) {
  const { isAuthenticated, userType, loading, user } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        const currentPath = window.location.pathname;
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(
          currentPath
        )}`;
        router.push(loginUrl);
        return;
      }

      // If specific user types are required
      if (isAuthenticated && allowedUserTypes.length > 0) {
        if (!allowedUserTypes.includes(userType)) {
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
          return;
        }
      }

      // User is authorized
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
  ]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, show fallback or nothing
  if (requireAuth && !isAuthenticated) {
    return fallbackComponent || null;
  }

  // If specific user types are required and user doesn't match, show fallback or nothing
  if (
    isAuthenticated &&
    allowedUserTypes.length > 0 &&
    !allowedUserTypes.includes(userType)
  ) {
    return (
      fallbackComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  // User is authorized, render children
  return isAuthorized ? children : null;
}

// Higher-order component for easier use
export function withProtectedRoute(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
