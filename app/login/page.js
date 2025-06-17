"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI, ApiError } from "@/libs/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get callback URL from search params or default to "/"
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleFormSubmit(ev) {
    ev.preventDefault();
    setLoginInProgress(true);
    setError("");
    setLoginSuccess(false);

    try {
      // First try to authenticate with your API
      const loginData = {
        email,
        password,
      };

      console.log("Attempting login...");

      // Using the centralized API
      const response = await authAPI.login(loginData);

      // If API login successful
      setLoginSuccess(true);
      console.log("API login successful:", response.data);

      // Then proceed with NextAuth signIn for session management
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false, // Handle redirect manually for better error control
      });

      if (result?.error) {
        // NextAuth signIn failed
        throw new Error(result.error);
      }

      // Success - redirect after a brief delay to show success message
      setTimeout(() => {
        router.push(callbackUrl);
      }, 1000);
    } catch (apiError) {
      console.error("Login error:", apiError);

      if (apiError instanceof ApiError) {
        // Handle specific API errors with detailed messages
        switch (apiError.status) {
          case 400:
            setError("Please enter a valid email and password.");
            break;
          case 401:
            setError("Invalid email or password. Please try again.");
            break;
          case 403:
            setError(
              "Your account has been suspended. Please contact support."
            );
            break;
          case 404:
            setError("Login service not available. Please try again later.");
            break;
          case 422:
            // Validation errors
            if (apiError.data && apiError.data.errors) {
              const errorMessages = Object.values(apiError.data.errors).flat();
              setError(errorMessages.join(". "));
            } else {
              setError("Please check your email and password format.");
            }
            break;
          case 429:
            setError(
              "Too many login attempts. Please wait a few minutes and try again."
            );
            break;
          case 500:
            setError("Server error. Please try again in a few minutes.");
            break;
          default:
            setError(apiError.message || "Login failed. Please try again.");
        }
      } else {
        // Handle network or other errors
        if (
          apiError.message === "NetworkError" ||
          apiError.message.includes("fetch")
        ) {
          setError(
            "Network error. Please check your internet connection and try again."
          );
        } else {
          setError("Login failed. Please try again.");
        }
      }
    } finally {
      setLoginInProgress(false);
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    return email && password;
  };

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
        </div>

        {/* Success Message */}
        {loginSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-green-800 font-medium mb-2 flex items-center justify-center gap-2">
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
            <div className="text-green-700 text-sm">
              Redirecting you to your dashboard...
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-red-800 font-medium mb-1 flex items-center justify-center gap-2">
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
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

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

            {/* Optional: Forgot Password Link */}
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              disabled={loginInProgress}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Image
                src={"/google.png"}
                alt={"Google logo"}
                width={20}
                height={20}
              />
              Continue with Google
            </button>
          </form>

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
        </div>
      </div>
    </section>
  );
}
