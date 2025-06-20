"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { restaurantAPI, getToken } from "@/libs/api";
import Cookies from "js-cookie";
import { MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function RestaurantOnboarding() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form data matching backend validation schema exactly
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisineType: "", // Changed from 'cuisine' to match backend
    phone: "",
    email: "",

    // Flattened address structure to match backend
    address: "", // Street address
    city: "",
    postalCode: "", // Changed from zipCode
    country: "France", // Default as per backend
    latitude: null,
    longitude: null,

    // Business settings
    deliveryFee: 0, // Added to match backend
    minimumOrder: 0, // Changed to number
    averageDeliveryTime: 30, // Changed to number

    // Opening hours in backend format (numeric keys, HHMM format)
    openingHours: {
      0: { open: 1000, close: 2100, isClosed: false }, // Sunday
      1: { open: 1100, close: 2200, isClosed: false }, // Monday
      2: { open: 1100, close: 2200, isClosed: false }, // Tuesday
      3: { open: 1100, close: 2200, isClosed: false }, // Wednesday
      4: { open: 1100, close: 2300, isClosed: false }, // Thursday
      5: { open: 1100, close: 2300, isClosed: false }, // Friday
      6: { open: 1000, close: 2300, isClosed: false }, // Saturday
    },

    tags: [],
    businessLicense: "",
  });

  const totalSteps = 3;

  // Cuisine type options
  const cuisineTypes = [
    "French",
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "Indian",
    "Thai",
    "Mediterranean",
    "American",
    "Greek",
    "Korean",
    "Vietnamese",
    "Lebanese",
    "Spanish",
    "Turkish",
    "Brazilian",
    "Ethiopian",
    "Other",
  ];

  // Popular restaurant tags
  const availableTags = [
    "fine-dining",
    "casual-dining",
    "fast-food",
    "family-friendly",
    "romantic",
    "vegetarian",
    "vegan",
    "gluten-free",
    "organic",
    "local-ingredients",
    "pizza",
    "burgers",
    "seafood",
    "steakhouse",
    "bakery",
    "cafe",
    "bar",
    "takeaway",
    "delivery-only",
    "halal",
    "kosher",
    "breakfast",
    "brunch",
    "late-night",
  ];

  // Days mapping for opening hours
  const daysOfWeek = [
    { key: 1, label: "Monday", index: 1 },
    { key: 2, label: "Tuesday", index: 2 },
    { key: 3, label: "Wednesday", index: 3 },
    { key: 4, label: "Thursday", index: 4 },
    { key: 5, label: "Friday", index: 5 },
    { key: 6, label: "Saturday", index: 6 },
    { key: 0, label: "Sunday", index: 0 },
  ];

  // Check authentication using cookie-based system
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const userDataCookie = Cookies.get("userData");

      console.log("Auth Check - Token:", token ? "Present" : "Missing");
      console.log(
        "Auth Check - UserData:",
        userDataCookie ? "Present" : "Missing"
      );

      if (!token || !userDataCookie) {
        console.log("No auth token or user data found, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        const userData = JSON.parse(userDataCookie);
        console.log("Parsed user data:", userData);

        if (userData.userType !== "restaurant_owner") {
          console.log(
            "User is not a restaurant owner, redirecting to dashboard"
          );
          router.push("/dashboard");
          return;
        }

        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Convert time string (HH:MM) to HHMM number format
  const timeStringToNumber = (timeString) => {
    if (!timeString) return 1100; // Default 11:00
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 100 + minutes;
  };

  // Convert HHMM number to HH:MM string format
  const timeNumberToString = (timeNumber) => {
    if (!timeNumber) return "11:00";
    const hours = Math.floor(timeNumber / 100);
    const minutes = timeNumber % 100;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOpeningHoursChange = (dayIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [dayIndex]: {
          ...prev.openingHours[dayIndex],
          [field]:
            field === "isClosed"
              ? value
              : field === "open" || field === "close"
              ? timeStringToNumber(value)
              : value,
        },
      },
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Validation functions
  const validateStep1 = () => {
    const errors = [];

    if (!formData.name || formData.name.length < 2) {
      errors.push("Restaurant name must be at least 2 characters long");
    }
    if (formData.name && formData.name.length > 100) {
      errors.push("Restaurant name cannot exceed 100 characters");
    }
    if (formData.description && formData.description.length > 1000) {
      errors.push("Description cannot exceed 1000 characters");
    }
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      errors.push("Please provide a valid phone number");
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please provide a valid email address");
    }
    if (!formData.address) {
      errors.push("Address is required");
    }
    if (formData.address && formData.address.length > 500) {
      errors.push("Address cannot exceed 500 characters");
    }
    if (!formData.city) {
      errors.push("City is required");
    }
    if (formData.city && formData.city.length > 100) {
      errors.push("City name cannot exceed 100 characters");
    }
    if (!formData.postalCode) {
      errors.push("Postal code is required");
    }
    if (formData.postalCode && formData.postalCode.length > 20) {
      errors.push("Postal code cannot exceed 20 characters");
    }

    return errors;
  };

  const validateStep2 = () => {
    const errors = [];

    if (formData.deliveryFee < 0 || formData.deliveryFee > 50) {
      errors.push("Delivery fee must be between 0 and 50");
    }
    if (formData.minimumOrder < 0) {
      errors.push("Minimum order cannot be negative");
    }
    if (
      formData.averageDeliveryTime < 10 ||
      formData.averageDeliveryTime > 120
    ) {
      errors.push("Average delivery time must be between 10 and 120 minutes");
    }
    if (formData.tags.length > 10) {
      errors.push("Cannot have more than 10 tags");
    }

    return errors;
  };

  const nextStep = () => {
    let errors = [];

    if (currentStep === 1) {
      errors = validateStep1();
    } else if (currentStep === 2) {
      errors = validateStep2();
    }

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    setError("");
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Final validation
      const step1Errors = validateStep1();
      const step2Errors = validateStep2();
      const allErrors = [...step1Errors, ...step2Errors];

      if (allErrors.length > 0) {
        setError(allErrors.join(". "));
        return;
      }

      // Check authentication before submitting
      const token = getToken();
      const userDataCookie = Cookies.get("userData");

      console.log("Pre-submit Auth Check:");
      console.log("- Token:", token ? "Present" : "Missing");
      console.log("- UserData:", userDataCookie ? "Present" : "Missing");

      if (!token || !userDataCookie) {
        setError("Authentication expired. Please log in again.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      // Prepare restaurant data matching backend schema exactly
      const restaurantData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        cuisineType: formData.cuisineType || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        deliveryFee: Number(formData.deliveryFee),
        minimumOrder: Number(formData.minimumOrder),
        averageDeliveryTime: Number(formData.averageDeliveryTime),
        openingHours: formData.openingHours,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        businessLicense: formData.businessLicense.trim() || undefined,
      };

      console.log("Submitting restaurant data:", restaurantData);

      const response = await restaurantAPI.createRestaurantData(restaurantData);
      console.log("API Response:", response);

      setSuccessMessage("Restaurant profile created successfully!");

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/restaurant");
      }, 2000);
    } catch (error) {
      console.error("Restaurant onboarding error:", error);

      if (error.message && error.message.includes("Unexpected token")) {
        setError("Authentication failed. You may need to log in again.");
        setTimeout(() => router.push("/login"), 2000);
      } else if (error.response) {
        console.error("API Error Response:", error.response);
        setError(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        console.error("Network Error:", error.request);
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          error.message ||
            "Failed to complete restaurant setup. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {user?.firstName}! Set Up Your Restaurant
          </h1>
          <p className="text-gray-600">
            Complete your restaurant profile to start receiving orders
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-green-800 font-medium">{successMessage}</div>
            <div className="text-green-700 text-sm mt-1">
              Redirecting to dashboard...
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8">
            {/* Step 1: Restaurant Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Restaurant Information
                  </h2>
                  <p className="text-gray-600">Tell us about your restaurant</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    placeholder="La Belle Cuisine"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">2-100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    placeholder="A fine dining restaurant specializing in French cuisine..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum 1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Type
                  </label>
                  <select
                    value={formData.cuisineType}
                    onChange={(e) =>
                      handleInputChange("cuisineType", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineTypes.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="+33123456789"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      International format
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="contact@restaurant.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    placeholder="123 Rue de la Paix"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum 500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="Paris"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="75001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    >
                      <option value="France">France</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business License
                  </label>
                  <input
                    type="text"
                    value={formData.businessLicense}
                    onChange={(e) =>
                      handleInputChange("businessLicense", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    placeholder="Business License Number"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum 100 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Business Settings & Tags */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Business Settings
                  </h2>
                  <p className="text-gray-600">
                    Configure your restaurant's operational details
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.01"
                      value={formData.deliveryFee}
                      onChange={(e) =>
                        handleInputChange(
                          "deliveryFee",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="2.50"
                    />
                    <p className="mt-1 text-sm text-gray-500">0-50 euros</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumOrder}
                      onChange={(e) =>
                        handleInputChange(
                          "minimumOrder",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="15.00"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum order amount
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Time (min)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={formData.averageDeliveryTime}
                      onChange={(e) =>
                        handleInputChange(
                          "averageDeliveryTime",
                          parseInt(e.target.value) || 30
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="30"
                    />
                    <p className="mt-1 text-sm text-gray-500">10-120 minutes</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Tags (max 10)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select tags that describe your restaurant
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        disabled={
                          !formData.tags.includes(tag) &&
                          formData.tags.length >= 10
                        }
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.tags.includes(tag)
                            ? "bg-yellow-500 text-white"
                            : formData.tags.length >= 10
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>
                          Selected tags ({formData.tags.length}/10):
                        </strong>{" "}
                        {formData.tags.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Opening Hours */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Opening Hours
                  </h2>
                  <p className="text-gray-600">
                    Set your restaurant's opening hours
                  </p>
                </div>

                <div className="space-y-4">
                  {daysOfWeek.map((day) => {
                    const dayData = formData.openingHours[day.index];
                    return (
                      <div
                        key={day.index}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
                      >
                        <div className="w-20">
                          <span className="font-medium text-gray-900">
                            {day.label}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={dayData.isClosed}
                            onChange={(e) =>
                              handleOpeningHoursChange(
                                day.index,
                                "isClosed",
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                          />
                          <label className="text-sm text-gray-700">
                            Closed
                          </label>
                        </div>

                        {!dayData.isClosed && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Open
                              </label>
                              <input
                                type="time"
                                value={timeNumberToString(dayData.open)}
                                onChange={(e) =>
                                  handleOpeningHoursChange(
                                    day.index,
                                    "open",
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Close
                              </label>
                              <input
                                type="time"
                                value={timeNumberToString(dayData.close)}
                                onChange={(e) =>
                                  handleOpeningHoursChange(
                                    day.index,
                                    "close",
                                    e.target.value
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Time Format
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Opening hours use 24-hour format. You can modify these
                          later in your restaurant settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}

              <div className="flex-1" />

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Creating Restaurant...</span>
                    </div>
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
