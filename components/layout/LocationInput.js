"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

function LocationInput() {
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Cookie configuration
  const LOCATION_COOKIE_OPTIONS = {
    expires: 30, // 30 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };

  useEffect(() => {
    const storedLocation = Cookies.get("userLocation");
    if (storedLocation) {
      try {
        const locationData = JSON.parse(storedLocation);
        setLocation(locationData.address);
      } catch (error) {
        console.error("Error parsing stored location:", error);
        // Clear invalid location cookie
        Cookies.remove("userLocation");
      }
    }
  }, []);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      setIsSubmitting(true);
      const locationData = {
        address: location.trim(),
        timestamp: new Date().toISOString(),
        isDetected: false,
      };

      Cookies.set(
        "userLocation",
        JSON.stringify(locationData),
        LOCATION_COOKIE_OPTIONS
      );
      setShowLocationInput(false);
      setIsSubmitting(false);
      router.push("/restaurants");
    }
  };

  const getCurrentLocation = () => {
    setIsSubmitting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const simulatedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(
            4
          )} (Detected Location)`;

          const locationData = {
            address: simulatedAddress,
            coordinates: { latitude, longitude },
            timestamp: new Date().toISOString(),
            isDetected: true,
          };

          Cookies.set(
            "userLocation",
            JSON.stringify(locationData),
            LOCATION_COOKIE_OPTIONS
          );
          setLocation(simulatedAddress);
          setShowLocationInput(false);
          setIsSubmitting(false);
          router.push("/restaurants");
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsSubmitting(false);
        }
      );
    } else {
      setIsSubmitting(false);
    }
  };

  const clearLocation = () => {
    Cookies.remove("userLocation");
    setLocation("");
    setShowLocationInput(true);
  };

  if (location && !showLocationInput) {
    return (
      <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-xs">
        <svg
          className="w-4 h-4 text-gray-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-sm text-gray-700 truncate flex-1">
          {location}
        </span>
        <button
          onClick={() => setShowLocationInput(true)}
          className="ml-2 text-yellow-600 hover:text-yellow-700 text-xs"
        >
          Change
        </button>
      </div>
    );
  }

  if (showLocationInput) {
    return (
      <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md">
        <form
          onSubmit={handleLocationSubmit}
          className="flex items-center flex-1"
        >
          <svg
            className="w-4 h-4 text-gray-400 ml-3 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter delivery address"
            className="flex-1 py-2 px-2 text-sm outline-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!location.trim() || isSubmitting}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Go"}
          </button>
        </form>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isSubmitting}
          className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          title="Use current location"
        >
          📍
        </button>
        <button
          onClick={() => setShowLocationInput(false)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowLocationInput(true)}
      className="hidden lg:flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-yellow-700 hover:bg-yellow-100 transition-colors"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span className="text-sm font-medium">Enter Location</span>
    </button>
  );
}

export default LocationInput;
