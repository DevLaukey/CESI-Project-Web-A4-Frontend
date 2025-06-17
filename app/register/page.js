"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authAPI, ApiError } from "@/libs/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get user type from URL parameters
  const userType = searchParams.get("type") || "end_user";

  // Validate user type on component mount
  useEffect(() => {
    const validTypes = ["end_user", "delivery_driver", "restaurant_owner"];
    if (!validTypes.includes(userType)) {
      router.push("/register?type=end_user");
    }
  }, [userType, router]);

  // Password validation function
  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 6;

    return {
      isValid: hasUppercase && hasLowercase && hasSpecialChar && hasMinLength,
      errors: {
        hasUppercase,
        hasLowercase,
        hasSpecialChar,
        hasMinLength,
      },
    };
  };

  async function handleFormSubmit(ev) {
    ev.preventDefault();
    setCreatingUser(true);
    setError("");
    setUserCreated(false);

    // Client-side password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const missingRequirements = [];
      if (!passwordValidation.errors.hasMinLength)
        missingRequirements.push("at least 6 characters");
      if (!passwordValidation.errors.hasUppercase)
        missingRequirements.push("an uppercase letter");
      if (!passwordValidation.errors.hasLowercase)
        missingRequirements.push("a lowercase letter");
      if (!passwordValidation.errors.hasSpecialChar)
        missingRequirements.push("a special character (!@#$%^&*)");

      setError(`Password must contain ${missingRequirements.join(", ")}.`);
      setCreatingUser(false);
      return;
    }

    try {
      const registrationData = {
        email,
        password,
        firstName,
        lastName,
        phone,
        userType, 
        address: "Not provided",
        city: "Not provided",
        postalCode: "00000",
      };

      console.log("Registering user with type:", userType);

      // Using the centralized API
      const response = await authAPI.register(registrationData);

      // If successful
      setUserCreated(true);
      console.log("Registration successful:", response.data);

      // Optional: Auto-redirect based on user type after success
      setTimeout(() => {
        switch (userType) {
          case "driver":
            router.push("/onboarding/driver");
            break;
          case "restaurant":
            router.push("/onboarding/restaurant");
            break;
          default:
            router.push("/login");
        }
      }, 2000);
    } catch (apiError) {
      console.error("Registration error:", apiError);

      if (apiError instanceof ApiError) {
        switch (apiError.status) {
          case 400:
            // Check if it's a password validation error from backend
            if (apiError.data && apiError.data.message) {
              const backendMessage = apiError.data.message.toLowerCase();
              if (backendMessage.includes("password")) {
                setError(
                  "Password must contain at least 6 characters, including uppercase, lowercase, and special characters (!@#$%^&*)."
                );
              } else if (backendMessage.includes("email")) {
                setError("Please enter a valid email address.");
              } else if (backendMessage.includes("phone")) {
                setError("Please enter a valid phone number.");
              } else {
                setError(apiError.data.message);
              }
            } else {
              setError(
                "Invalid information provided. Please check all fields and try again."
              );
            }
            break;
          case 404:
            setError(
              "Registration endpoint not found. Please contact support."
            );
            break;
          case 409:
            setError(
              "An account with this email already exists. Please try logging in instead."
            );
            break;
          case 422:
            if (apiError.data && apiError.data.errors) {
              const errorMessages = Object.values(apiError.data.errors).flat();
              setError(errorMessages.join(". "));
            } else {
              setError("Please check your information and try again.");
            }
            break;
          case 500:
            setError("Server error. Please try again in a few minutes.");
            break;
          default:
            setError(
              apiError.message || "Registration failed. Please try again."
            );
        }
      } else {
        // Handle network or other errors
        setError(
          "Network error. Please check your internet connection and try again."
        );
      }
    } finally {
      setCreatingUser(false);
    }
  }

  // Check if form is valid
  const isFormValid = () => {
    return email && password && firstName && lastName && phone;
  };

  return (
    <section
      className={`min-h-screen bg-gradient-to-br py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-center text-primary text-4xl font-bold mb-2">
            Register
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Create your new account
          </p>
        </div>

        {/* Success Message */}
        {userCreated && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-green-800 font-medium mb-2 flex items-center justify-center gap-2">
              Account created successfully!
            </div>
            <div className="text-green-700 text-sm">
              {userType === "end_user" ? (
                <>
                  You can now{" "}
                  <Link
                    className="text-yellow-600 hover:text-yellow-700 underline font-medium"
                    href="/login"
                  >
                    sign in to your account →
                  </Link>
                </>
              ) : (
                <>Redirecting to {userType} onboarding...</>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-red-800 font-medium mb-1 flex items-center justify-center gap-2">
              Registration failed
            </div>
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <form className="p-8 space-y-6" onSubmit={handleFormSubmit}>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  disabled={creatingUser}
                  onChange={(ev) => setFirstName(ev.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  disabled={creatingUser}
                  onChange={(ev) => setLastName(ev.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                disabled={creatingUser}
                onChange={(ev) => setEmail(ev.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                disabled={creatingUser}
                onChange={(ev) => setPhone(ev.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password *
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                disabled={creatingUser}
                onChange={(ev) => setPassword(ev.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400"
                required
                minLength={6}
              />

              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 font-medium">
                  Password must contain:
                </p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div
                    className={`flex items-center gap-1 ${
                      password.length >= 6 ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        password.length >= 6 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></span>
                    6+ characters
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      /[A-Z]/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        /[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></span>
                    Uppercase letter
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      /[a-z]/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        /[a-z]/.test(password) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></span>
                    Lowercase letter
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      /[!@#$%^&*(),.?":{}|<>]/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        /[!@#$%^&*(),.?":{}|<>]/.test(password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    Special character
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingUser || !isFormValid()}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 py-4 px-6 rounded-xl font-bold focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transform hover:scale-105"
            >
              {creatingUser ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900"
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
                  Creating your account...
                </>
              ) : (
                `Create ${
                  userType === "end_user"
                    ? "Customer"
                    : userType.charAt(0).toUpperCase() + userType.slice(1)
                } Account`
              )}
            </button>

            <div className="relative my-8">
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
              onClick={() => signIn("google", { callbackUrl: "/" })}
              disabled={creatingUser}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-50 hover:border-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
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

          
        </div>
      </div>
    </section>
  );
}
