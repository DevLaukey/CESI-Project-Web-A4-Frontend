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

  // Address validation state
  const [addressValidation, setAddressValidation] = useState({
    isValidating: false,
    isValid: false,
    coordinates: null,
    suggestion: null,
    error: null,
  });

  // Form data matching your API requirements exactly
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "", // Changed from cuisineType to cuisine
    phone: "",
    email: "",
    website: "",
    priceRange: "$",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      latitude: null,
      longitude: null,
    },

    // Operating Hours in backend format (string format HH:MM-HH:MM)
    operatingHours: {
      monday: "11:00-22:00",
      tuesday: "11:00-22:00",
      wednesday: "11:00-22:00",
      thursday: "11:00-23:00",
      friday: "11:00-23:00",
      saturday: "10:00-23:00",
      sunday: "10:00-21:00",
    },

    tags: [],
    businessLicense: "",
  });

  // File upload state
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);

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

  // Days of the week for operating hours
  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
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

  // Debounced address validation
  useEffect(() => {
    const validateAddress = async () => {
      if (!formData.address || !formData.city || !formData.postalCode) {
        setAddressValidation({
          isValidating: false,
          isValid: false,
          coordinates: null,
          suggestion: null,
          error: null,
        });
        return;
      }

      const timeoutId = setTimeout(async () => {
        setAddressValidation((prev) => ({
          ...prev,
          isValidating: true,
          error: null,
        }));

        try {
          const coordinates = await geocodeAddress(
            formData.address,
            formData.city,
            formData.postalCode,
            formData.country
          );

          if (coordinates) {
            setAddressValidation({
              isValidating: false,
              isValid: true,
              coordinates,
              suggestion: null,
              error: null,
            });

            // Update form data with coordinates
            setFormData((prev) => ({
              ...prev,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }));
          } else {
            setAddressValidation({
              isValidating: false,
              isValid: false,
              coordinates: null,
              suggestion: null,
              error: "Address not found. Please check your address details.",
            });
          }
        } catch (error) {
          console.error("Address validation error:", error);
          setAddressValidation({
            isValidating: false,
            isValid: false,
            coordinates: null,
            suggestion: null,
            error: "Unable to validate address. Please try again.",
          });
        }
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    };

    validateAddress();
  }, [formData.address, formData.city, formData.postalCode, formData.country]);

  const handleInputChange = (field, value) => {
    if (field.startsWith("address.")) {
      const addressField = field.replace("address.", "");
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    if (field === "closed") {
      // If closing the restaurant for this day, set to "Closed"
      setFormData((prev) => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [day]: value ? "Closed" : "11:00-22:00", // Default hours when reopening
        },
      }));
    } else {
      // Update open or close time
      const currentHours = formData.operatingHours[day];
      if (currentHours === "Closed") return; // Don't update if closed

      const [openTime, closeTime] = currentHours.split("-");
      const newHours =
        field === "open" ? `${value}-${closeTime}` : `${openTime}-${value}`;

      setFormData((prev) => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [day]: newHours,
        },
      }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleFileUpload = (file) => {
    setBusinessLicenseFile(file);
    if (file) {
      // For now, we'll use the filename as the license identifier
      // In production, you'd want to upload this file to your server/cloud storage
      setFormData((prev) => ({
        ...prev,
        businessLicense: file.name.split(".")[0],
      }));
    } else {
      setFormData((prev) => ({ ...prev, businessLicense: "" }));
    }
  };

  // Enhanced geocoding with better error handling
  const geocodeAddress = async (address, city, postalCode, country) => {
    try {
      const fullAddress = `${address}, ${city}, ${postalCode}, ${country}`;
      console.log("Geocoding address:", fullAddress);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fullAddress
        )}&limit=1&addressdetails=1`,
        {
          headers: {
            "User-Agent": "RestaurantApp/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding service error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Geocoding response:", data);

      if (data && data.length > 0) {
        const result = data[0];
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);

        // Validate that we got valid numbers
        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error("Invalid coordinates received");
        }

        return {
          latitude,
          longitude,
          displayName: result.display_name,
          address: result.address,
        };
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  // Parse operating hours for display (HH:MM-HH:MM -> {open: HH:MM, close: HH:MM})
  const parseOperatingHours = (hoursString) => {
    if (hoursString === "Closed") {
      return { open: "", close: "", closed: true };
    }
    const [open, close] = hoursString.split("-");
    return { open, close, closed: false };
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        // Basic restaurant information + address validation
        return (
          formData.name &&
          formData.description &&
          formData.cuisine &&
          formData.phone &&
          formData.email &&
          formData.address.street &&
          formData.address.city &&
          formData.address.zipCode &&
          businessLicenseFile &&
          addressValidation.isValid &&
          formData.address.latitude !== null &&
          formData.address.longitude !== null
        );
      case 2:
        // Business settings
        return formData.priceRange;
      case 3:
        // Operating hours are pre-filled with defaults
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setError("");
    } else {
      if (currentStep === 1 && !addressValidation.isValid) {
        setError(
          "Please provide a valid address with proper coordinates before proceeding."
        );
      } else {
        setError("Please fill in all required fields before proceeding.");
      }
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
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

      // Ensure we have valid coordinates
      if (
        !formData.latitude ||
        !formData.longitude ||
        isNaN(formData.latitude) ||
        isNaN(formData.longitude)
      ) {
        setError("Invalid address coordinates. Please verify your address.");
        return;
      }

      // Prepare restaurant data with proper number conversion
      const restaurantData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        cuisineType: formData.cuisineType,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country,
        latitude: Number(formData.latitude), // Ensure it's a number
        longitude: Number(formData.longitude), // Ensure it's a number
        minimumOrder: Number(parseFloat(formData.minimumOrder)), // Ensure it's a number
        averageDeliveryTime: Number(parseInt(formData.averageDeliveryTime)), // Ensure it's a number
        openingHours: formData.openingHours,
        tags: formData.tags,
        businessLicense: formData.businessLicense,
      };

      console.log("Submitting restaurant data:", restaurantData);
      console.log("Coordinates verification:", {
        latitude: typeof restaurantData.latitude,
        longitude: typeof restaurantData.longitude,
        latValue: restaurantData.latitude,
        lonValue: restaurantData.longitude,
      });

      const response = await restaurantAPI.createRestaurantData(restaurantData);
      console.log("API Response:", response);

      setSuccessMessage("Restaurant profile created successfully!");

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/restaurant");
      }, 2000);
    } catch (error) {
      console.error("Restaurant onboarding error:", error);

      // Better error handling for different types of errors
      if (error.message && error.message.includes("Unexpected token")) {
        setError("Authentication failed. You may need to log in again.");
        setTimeout(() => router.push("/login"), 2000);
      } else if (error.response) {
        // API returned an error response
        console.error("API Error Response:", error.response);
        setError(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        // Network error
        console.error("Network Error:", error.request);
        setError("Network error. Please check your connection and try again.");
      } else {
        // Other error
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
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    placeholder="La Belle Cuisine"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    placeholder="A fine dining restaurant specializing in French cuisine..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Type *
                  </label>
                  <select
                    value={formData.cuisineType}
                    onChange={(e) =>
                      handleInputChange("cuisineType", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                    required
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
                      Restaurant Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="+33 1 23 45 67 89"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restaurant Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="contact@labellecuisine.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Address *
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
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
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="75002"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      required
                    >
                      <option value="France">France</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                </div>

                {/* Address Validation Status */}
                {(formData.address || formData.city || formData.postalCode) && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Address Validation
                      </span>
                    </div>

                    {addressValidation.isValidating && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Validating address...</span>
                      </div>
                    )}

                    {addressValidation.isValid && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm">
                          Address verified successfully!
                        </span>
                      </div>
                    )}

                    {addressValidation.error && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-sm">
                          {addressValidation.error}
                        </span>
                      </div>
                    )}

                    {addressValidation.coordinates && (
                      <div className="mt-2 text-xs text-gray-500">
                        Coordinates:{" "}
                        {addressValidation.coordinates.latitude.toFixed(6)},{" "}
                        {addressValidation.coordinates.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business License *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                    required
                  />
                  {businessLicenseFile && (
                    <p className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                      <CheckCircle size={16} />
                      <span>{businessLicenseFile.name} selected</span>
                    </p>
                  )}
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

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
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
                      <h3 className="text-sm font-medium text-blue-800">
                        Platform Delivery Service
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Our platform handles all delivery logistics and fees.
                          You just need to set your minimum order amount and
                          preparation time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount (€) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumOrder}
                      onChange={(e) =>
                        handleInputChange("minimumOrder", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="15.00"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Customers must order at least this amount
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Time (minutes) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.averageDeliveryTime}
                      onChange={(e) =>
                        handleInputChange("averageDeliveryTime", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="30"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      How long to prepare orders on average
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Tags
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select tags that describe your restaurant (optional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.tags.includes(tag)
                            ? "bg-yellow-500 text-white"
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
                        <strong>Selected tags:</strong>{" "}
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
                    Set your restaurant's operating hours
                  </p>
                </div>

                <div className="space-y-4">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day.key}
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
                          checked={
                            formData.openingHours[day.key]?.closed || false
                          }
                          onChange={(e) =>
                            handleOpeningHoursChange(
                              day.key,
                              "closed",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                        <label className="text-sm text-gray-700">Closed</label>
                      </div>

                      {!formData.openingHours[day.key]?.closed && (
                        <>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Open
                            </label>
                            <input
                              type="time"
                              value={formatTime(
                                formData.openingHours[day.key]?.open || 1100
                              )}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day.key,
                                  "open",
                                  parseTime(e.target.value)
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
                              value={formatTime(
                                formData.openingHours[day.key]?.close || 2200
                              )}
                              onChange={(e) =>
                                handleOpeningHoursChange(
                                  day.key,
                                  "close",
                                  parseTime(e.target.value)
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
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
                          Opening hours are stored in 24-hour format. You can
                          modify these later in your restaurant settings.
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
                  className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
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
