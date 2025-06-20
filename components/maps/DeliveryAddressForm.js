"use client";
import { useState } from "react";
import { MapPin, User, Phone, MessageSquare, Save } from "lucide-react";
import AddressInput from "./AddressInput";
import GoogleMapsAddressPicker from "./GoogleMapsAddressPicker";

// Example restaurant location (replace with actual restaurant coordinates)
const RESTAURANT_LOCATION = {
  lat: 48.8566, // Paris coordinates - replace with your restaurant
  lng: 2.3522,
};

const DELIVERY_RADIUS = 10000; // 10km in meters

export default function DeliveryAddressForm({ onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    // Address data
    address: initialData?.address || null,

    // Contact details
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",

    // Delivery instructions
    deliveryInstructions: initialData?.deliveryInstructions || "",
    apartmentNumber: initialData?.apartmentNumber || "",
    buzzerCode: initialData?.buzzerCode || "",

    // Address type
    addressType: initialData?.addressType || "home", // home, work, other

    // Save options
    saveAddress: initialData?.saveAddress || false,
    setAsDefault: initialData?.setAsDefault || false,
  });

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle address selection
  const handleAddressChange = (addressData) => {
    setFormData((prev) => ({
      ...prev,
      address: addressData,
    }));

    // Clear address-related errors
    setErrors((prev) => ({
      ...prev,
      address: null,
    }));
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error
    setErrors((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.address) {
      newErrors.address = "Please select a delivery address";
    } else if (!formData.address.isInDeliveryArea) {
      newErrors.address = "This address is outside our delivery area";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        // Add calculated delivery time and fee
        estimatedDeliveryTime: calculateDeliveryTime(formData.address),
        deliveryFee: calculateDeliveryFee(formData.address),
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting delivery form:", error);
      setErrors({
        submit: "Failed to save delivery information. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate delivery time (mock implementation)
  const calculateDeliveryTime = (address) => {
    if (!address) return null;

    // Simple distance-based calculation (replace with actual logic)
    const baseTime = 30; // 30 minutes base
    const distance = getDistanceFromRestaurant(address.coordinates);
    const additionalTime = Math.floor(distance / 1000) * 2; // 2 minutes per km

    return Math.min(baseTime + additionalTime, 60); // Max 60 minutes
  };

  // Calculate delivery fee (mock implementation)
  const calculateDeliveryFee = (address) => {
    if (!address) return null;

    const distance = getDistanceFromRestaurant(address.coordinates);
    const baseFee = 2.5; // €2.50 base fee
    const distanceFee = Math.floor(distance / 1000) * 0.5; // €0.50 per km

    return Math.max(baseFee + distanceFee, 0);
  };

  // Get distance from restaurant (mock implementation)
  const getDistanceFromRestaurant = (coordinates) => {
    // This would use Google Maps distance calculation in real implementation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (RESTAURANT_LOCATION.lat * Math.PI) / 180;
    const φ2 = (coordinates.lat * Math.PI) / 180;
    const Δφ = ((coordinates.lat - RESTAURANT_LOCATION.lat) * Math.PI) / 180;
    const Δλ = ((coordinates.lng - RESTAURANT_LOCATION.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <MapPin size={24} />
          <span>Delivery Information</span>
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Please provide your delivery address and contact information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Address Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Address *
          </label>

          <div className="space-y-3">
            <AddressInput
              onAddressChange={handleAddressChange}
              initialValue={formData.address?.formattedAddress || ""}
              placeholder="Enter your delivery address..."
              deliveryRadius={DELIVERY_RADIUS}
              restaurantLocation={RESTAURANT_LOCATION}
              required
              className="w-full"
            />

            {errors.address && (
              <p className="text-red-600 text-sm">{errors.address}</p>
            )}

            <button
              type="button"
              onClick={() => setShowMapPicker(!showMapPicker)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              {showMapPicker ? "Hide map" : "Or select on map"}
            </button>
          </div>

          {/* Map Picker */}
          {showMapPicker && (
            <div className="mt-4">
              <GoogleMapsAddressPicker
                onAddressSelect={handleAddressChange}
                initialAddress={formData.address}
                deliveryRadius={DELIVERY_RADIUS}
                restaurantLocation={RESTAURANT_LOCATION}
                className="h-96"
              />
            </div>
          )}
        </div>

        {/* Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apartment/Unit Number
            </label>
            <input
              type="text"
              value={formData.apartmentNumber}
              onChange={(e) =>
                handleInputChange("apartmentNumber", e.target.value)
              }
              placeholder="e.g., Apt 4B, Unit 12"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buzzer/Door Code
            </label>
            <input
              type="text"
              value={formData.buzzerCode}
              onChange={(e) => handleInputChange("buzzerCode", e.target.value)}
              placeholder="e.g., #1234, Ring twice"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <User size={20} />
            <span>Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                required
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                required
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+33 1 23 45 67 89"
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                required
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Address Type
          </label>
          <div className="flex space-x-4">
            {[
              { value: "home", label: "Home", icon: "🏠" },
              { value: "work", label: "Work", icon: "🏢" },
              { value: "other", label: "Other", icon: "📍" },
            ].map((type) => (
              <label
                key={type.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={type.value}
                  checked={formData.addressType === type.value}
                  onChange={(e) =>
                    handleInputChange("addressType", e.target.value)
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {type.icon} {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Instructions */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <MessageSquare size={16} />
            <span>Delivery Instructions</span>
          </label>
          <textarea
            value={formData.deliveryInstructions}
            onChange={(e) =>
              handleInputChange("deliveryInstructions", e.target.value)
            }
            placeholder="e.g., Ring doorbell twice, Leave at front door, Call when arriving..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {/* Save Options */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.saveAddress}
              onChange={(e) =>
                handleInputChange("saveAddress", e.target.checked)
              }
              className="text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="text-sm text-gray-700">
              Save this address for future orders
            </span>
          </label>

          {formData.saveAddress && (
            <label className="flex items-center space-x-2 cursor-pointer ml-6">
              <input
                type="checkbox"
                checked={formData.setAsDefault}
                onChange={(e) =>
                  handleInputChange("setAsDefault", e.target.checked)
                }
                className="text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700">
                Set as default delivery address
              </span>
            </label>
          )}
        </div>

        {/* Delivery Summary */}
        {formData.address && formData.address.isInDeliveryArea && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">
              Delivery Summary
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>
                Estimated delivery time:{" "}
                {calculateDeliveryTime(formData.address)} minutes
              </p>
              <p>
                Delivery fee: €
                {calculateDeliveryFee(formData.address)?.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.address?.isInDeliveryArea}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Save size={20} />
          <span>
            {isSubmitting ? "Saving..." : "Save Delivery Information"}
          </span>
        </button>
      </form>
    </div>
  );
}
