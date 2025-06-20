"use client";
// Remove this line: import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { authAPI } from "@/libs/api";
import "./styles.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, userType: authUserType } = useAuth();

  // Get redirect URL from search params
  const redirectUrl =
    searchParams.get("redirect") || searchParams.get("callbackUrl");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination = redirectUrl || getRedirectUrl(authUserType);
      console.log("User already authenticated, redirecting to:", destination);
      router.push(destination);
    }
  }, [isAuthenticated, authUserType, redirectUrl, router]);

  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        setLoginSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getRedirectUrl = (userType) => {
    // First check if there's a redirect URL and if it's appropriate for the user type
    if (redirectUrl) {
      const isRestaurantRoute = redirectUrl.startsWith("/restaurant");
      const isDeliveryRoute = redirectUrl.startsWith("/delivery");

      if (userType === "restaurant_owner" && isRestaurantRoute) {
        return redirectUrl;
      }
      if (userType === "delivery_driver" && isDeliveryRoute) {
        return redirectUrl;
      }
      if (userType === "end_user" && !isRestaurantRoute && !isDeliveryRoute) {
        return redirectUrl;
      }
    }

    // Default redirects based on user type
    switch (userType) {
      case "restaurant_owner":
        return "/restaurant";
      case "delivery_driver":
        return "/delivery";
      case "end_user":
      case "user":
      default:
        return "/";
    }
  };

  const handleLoginError = (error) => {
    console.error("Login error:", error);

    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return "Please enter a valid email and password.";
        case 401:
          return "Invalid email or password. Please try again.";
        case 403:
          return "Your account has been suspended. Please contact support.";
        case 404:
          return "Login service not available. Please try again later.";
        case 422:
          if (error.response.data && error.response.data.errors) {
            const errorMessages = Object.values(
              error.response.data.errors
            ).flat();
            return errorMessages.join(". ");
          }
          return "Please check your email and password format.";
        case 429:
          return "Too many login attempts. Please wait a few minutes and try again.";
        case 500:
          return "Server error. Please try again in a few minutes.";
        default:
          return (
            error.response.data?.message || "Login failed. Please try again."
          );
      }
    }

    if (error.message) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch") ||
        error.name === "TypeError"
      ) {
        return "Network error. Please check your internet connection and try again.";
      }

      if (
        errorMessage.includes("400") ||
        errorMessage.includes("bad request")
      ) {
        return "Please enter a valid email and password.";
      }

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("invalid")
      ) {
        return "Invalid email or password. Please try again.";
      }

      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        return "Your account has been suspended. Please contact support.";
      }

      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        return "Login service not available. Please try again later.";
      }

      if (errorMessage.includes("422") || errorMessage.includes("validation")) {
        return "Please check your email and password format.";
      }

      if (errorMessage.includes("429") || errorMessage.includes("too many")) {
        return "Too many login attempts. Please wait a few minutes and try again.";
      }

      if (
        errorMessage.includes("500") ||
        errorMessage.includes("server error")
      ) {
        return "Server error. Please try again in a few minutes.";
      }

      return error.message;
    }

    return "Login failed. Please try again.";
  };

  async function handleFormSubmit(ev) {
    ev.preventDefault();
    setLoginInProgress(true);
    setError("");
    setLoginSuccess(false);
    setUserType(null);

    try {
      const loginData = { email, password };
      console.log("🔐 Attempting login...");

      const response = await authAPI.login(loginData);
      console.log("📋 Login response:", response);

      setLoginSuccess(true);

      const userData = response.user || response.data?.user;
      const token = response.token || response.data?.token;

      if (!userData || !token) {
        throw new Error("Invalid response format from server");
      }

      const detectedUserType =
        userData.userType || userData.role || userData.type || "end_user";
      setUserType(detectedUserType);
      console.log("👤 User type:", detectedUserType);

      // Login to context (this sets cookies too)
      login({
        user: userData,
        token: token,
        message: response.message,
      });

      console.log("✅ Login context updated");

      // Small delay then redirect
      setTimeout(() => {
        const redirectPath = getRedirectUrl(detectedUserType);
        console.log(`🎯 Redirecting ${detectedUserType} to ${redirectPath}`);
        router.push(redirectPath);
      }, 1000);
    } catch (apiError) {
      console.error("Login error:", apiError);
      const errorMessage = handleLoginError(apiError);
      setError(errorMessage);
    } finally {
      setLoginInProgress(false);
    }
  }

  const isFormValid = () => {
    return email && password;
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-primary text-4xl font-bold mb-2">
            Login
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Sign in to your account
          </p>
          {redirectUrl && (
            <p className="text-center text-sm text-blue-600 mt-2">
              Please sign in to access the requested page
            </p>
          )}
        </div>

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {loginSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg min-w-[300px] animate-slide-in-right">
              <div className="text-green-800 font-medium mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Login successful!
                </div>
                <button
                  onClick={() => setLoginSuccess(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-green-700 text-sm">
                {userType &&
                  `Welcome back! Redirecting to your ${userType} dashboard...`}
                {!userType && "Redirecting you to your dashboard..."}
              </div>
              <div className="w-full bg-green-200 rounded-full h-1 mt-3">
                <div className="bg-green-500 h-1 rounded-full animate-progress"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg min-w-[300px] animate-slide-in-right">
              <div className="text-red-800 font-medium mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Login failed
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-red-700 text-sm">{error}</div>
              <div className="w-full bg-red-200 rounded-full h-1 mt-3">
                <div className="bg-red-500 h-1 rounded-full animate-progress"></div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                disabled={loginInProgress}
                onChange={(ev) => setEmail(ev.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                disabled={loginInProgress}
                onChange={(ev) => setPassword(ev.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              disabled={loginInProgress || !isFormValid()}
              type="submit"
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loginInProgress ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
