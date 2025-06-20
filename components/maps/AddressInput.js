"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Loader } from "@googlemaps/js-api-loader";
import {
  MapPin,
  Search,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places", "geometry"],
};

export default function AddressInput({
  onAddressChange,
  initialValue = "",
  placeholder = "Enter your address...",
  className = "",
  required = false,
  deliveryRadius = null,
  restaurantLocation = null,
  countryRestriction = "fr", // ISO country code
}) {
  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(initialValue);
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // 'valid', 'invalid', or null
  const [sessionToken, setSessionToken] = useState(null);

  // Refs
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const currentRequestId = useRef(0);
  const dropdownRef = useRef(null);

  // State for dropdown positioning
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Initialize Google Maps services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsLoading(true);

        if (!GOOGLE_MAPS_CONFIG.apiKey) {
          throw new Error("Google Maps API key is not configured");
        }

        const loader = new Loader(GOOGLE_MAPS_CONFIG);
        await loader.load();

        // Create session token for billing optimization
        if (window.google?.maps?.places?.AutocompleteSessionToken) {
          const token =
            new window.google.maps.places.AutocompleteSessionToken();
          setSessionToken(token);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, []);

  // Safe data extraction from suggestions
  const extractSuggestionData = useCallback((suggestion) => {
    try {
      const placePrediction = suggestion?.placePrediction;
      if (!placePrediction) {
        console.warn("Missing placePrediction in suggestion");
        return null;
      }

      // Safe access to text properties with multiple fallbacks
      const fullText = placePrediction.text?.text || "";
      const mainText =
        placePrediction.structuredFormat?.mainText?.text ||
        placePrediction.text?.text ||
        "Unknown location";
      const secondaryText =
        placePrediction.structuredFormat?.secondaryText?.text || "";
      const placeId = placePrediction.placeId || null;

      if (!placeId) {
        console.warn("Missing placeId in suggestion");
        return null;
      }

      return {
        place_id: placeId,
        description: fullText,
        structured_formatting: {
          main_text: mainText,
          secondary_text: secondaryText,
        },
        fullText,
        mainText,
        secondaryText,
      };
    } catch (error) {
      console.warn("Error extracting suggestion data:", error);
      return null;
    }
  }, []);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback(
    async (value) => {
      setSearchValue(value);
      setValidationStatus(null);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.length < 3) {
        setPredictions([]);
        setShowPredictions(false);
        setSelectedAddress(null);
        if (onAddressChange) {
          onAddressChange(null);
        }
        return;
      }

      if (!isLoaded || !window.google?.maps?.places?.AutocompleteSuggestion)
        return;

      // Increment request ID for race condition handling
      const requestId = ++currentRequestId.current;

      // Debounce the search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // Basic request configuration
          const request = {
            input: value,
            ...(sessionToken && { sessionToken }),
            ...(countryRestriction && {
              includedRegionCodes: [countryRestriction.toUpperCase()],
            }),
          };

          console.log("Making autocomplete request with:", request);

          let suggestions = [];

          try {
            // Use the new AutocompleteSuggestion API
            const response =
              await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
                request
              );
            suggestions = response?.suggestions || [];
          } catch (error) {
            console.log("Autocomplete request failed:", error.message);

            // Fallback: try without region restriction
            if (countryRestriction) {
              try {
                const fallbackRequest = {
                  input: value,
                  ...(sessionToken && { sessionToken }),
                };
                const response =
                  await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
                    fallbackRequest
                  );
                suggestions = response?.suggestions || [];
              } catch (fallbackError) {
                console.error("Fallback request also failed:", fallbackError);
              }
            }
          }

          // Check if this response is still relevant (handle race conditions)
          if (requestId !== currentRequestId.current) {
            return;
          }

          if (suggestions && suggestions.length > 0) {
            // Filter for address-like results and extract data safely
            const transformedPredictions = suggestions
              .map((suggestion) => extractSuggestionData(suggestion))
              .filter((data) => data !== null); // Remove failed extractions

            // Additional filtering for address-like content
            const addressSuggestions = transformedPredictions.filter(
              (prediction) => {
                const text = prediction.fullText.toLowerCase();
                // Basic filter for address-like content (contains numbers or common address words)
                return (
                  /\d/.test(text) ||
                  text.includes("rue") ||
                  text.includes("avenue") ||
                  text.includes("street") ||
                  text.includes("boulevard") ||
                  text.includes("place") ||
                  text.includes("chemin") ||
                  text.includes("allée") ||
                  text.includes("impasse") ||
                  text.includes("cours")
                );
              }
            );

            // Use address suggestions if available, otherwise use all suggestions
            const relevantSuggestions =
              addressSuggestions.length > 0
                ? addressSuggestions
                : transformedPredictions;

            setPredictions(relevantSuggestions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        } catch (error) {
          console.error("Error getting autocomplete suggestions:", error);
          // Only clear predictions if this is the latest request
          if (requestId === currentRequestId.current) {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      }, 300); // 300ms debounce
    },
    [
      countryRestriction,
      onAddressChange,
      isLoaded,
      sessionToken,
      extractSuggestionData,
    ]
  );

  const getPlaceDetails = useCallback(
    async (placeId) => {
      if (!window.google?.maps?.places?.Place) {
        throw new Error("Places API not loaded");
      }

      try {
        const place = new window.google.maps.places.Place({
          id: placeId,
          ...(sessionToken && { sessionToken }),
        });

        // Fetch place details
        await place.fetchFields([
          "id",
          "displayName",
          "formattedAddress",
          "location",
          "addressComponents",
        ]);

        return {
          place_id: place.id,
          formatted_address: place.formattedAddress,
          geometry: {
            location: {
              lat: place.location.lat(),
              lng: place.location.lng(),
            },
          },
          address_components: place.addressComponents || [],
        };
      } catch (error) {
        console.error("Error fetching place details:", error);
        throw new Error("Unable to get place details");
      }
    },
    [sessionToken]
  );

  // Parse address components
  const parseAddressComponents = (components) => {
    const addressMap = {};

    if (!components || !Array.isArray(components)) {
      return addressMap;
    }

    components.forEach((component) => {
      const types = component.types || [];
      if (types.includes("street_number")) {
        addressMap.streetNumber = component.longText || component.shortText;
      }
      if (types.includes("route")) {
        addressMap.street = component.longText || component.shortText;
      }
      if (types.includes("locality")) {
        addressMap.city = component.longText || component.shortText;
      }
      if (types.includes("postal_code")) {
        addressMap.postalCode = component.longText || component.shortText;
      }
      if (types.includes("country")) {
        addressMap.country = component.longText;
        addressMap.countryCode = component.shortText;
      }
      if (types.includes("administrative_area_level_1")) {
        addressMap.state = component.longText || component.shortText;
      }
    });

    return addressMap;
  };

  // Check delivery area
  const checkDeliveryArea = useCallback(
    (addressLocation) => {
      if (
        !restaurantLocation ||
        !deliveryRadius ||
        !window.google?.maps?.geometry
      )
        return true;

      try {
        const distance =
          window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(
              restaurantLocation.lat,
              restaurantLocation.lng
            ),
            new window.google.maps.LatLng(
              addressLocation.lat,
              addressLocation.lng
            )
          );

        return distance <= deliveryRadius;
      } catch (error) {
        console.error("Error calculating distance:", error);
        return true; // Default to true if calculation fails
      }
    },
    [restaurantLocation, deliveryRadius]
  );

  // Handle prediction selection
  const handlePredictionSelect = useCallback(
    async (prediction) => {
      setShowPredictions(false);
      setSearchValue(prediction.description);
      setIsValidating(true);

      try {
        const place = await getPlaceDetails(prediction.place_id);
        const addressComponents = parseAddressComponents(
          place.address_components
        );

        const addressData = {
          placeId: place.place_id,
          formattedAddress: place.formatted_address,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          components: addressComponents,
        };

        // Check delivery area if applicable
        if (restaurantLocation && deliveryRadius) {
          const isInDeliveryArea = checkDeliveryArea(addressData.coordinates);
          addressData.isInDeliveryArea = isInDeliveryArea;
          setValidationStatus(isInDeliveryArea ? "valid" : "invalid");
        } else {
          addressData.isInDeliveryArea = true;
          setValidationStatus("valid");
        }

        setSelectedAddress(addressData);

        if (onAddressChange) {
          onAddressChange(addressData);
        }

        // Refresh session token after successful selection
        if (window.google?.maps?.places?.AutocompleteSessionToken) {
          const newToken =
            new window.google.maps.places.AutocompleteSessionToken();
          setSessionToken(newToken);
        }
      } catch (err) {
        console.error("Error getting place details:", err);
        setValidationStatus("invalid");
      } finally {
        setIsValidating(false);
      }
    },
    [
      getPlaceDetails,
      checkDeliveryArea,
      restaurantLocation,
      deliveryRadius,
      onAddressChange,
    ]
  );

  // Clear input
  const clearInput = () => {
    setSearchValue("");
    setSelectedAddress(null);
    setValidationStatus(null);
    setShowPredictions(false);

    // Clear timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (onAddressChange) {
      onAddressChange(null);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Create new session token
    if (window.google?.maps?.places?.AutocompleteSessionToken) {
      const newToken = new window.google.maps.places.AutocompleteSessionToken();
      setSessionToken(newToken);
    }
  };

  // Update dropdown position when predictions show
  useEffect(() => {
    if (showPredictions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const inputContainer = inputRef.current.closest(
        'div[class*="relative flex items-center"]'
      );
      const containerRect = inputContainer?.getBoundingClientRect() || rect;

      setDropdownPosition({
        top: containerRect.bottom + window.scrollY + 4, 
        left: containerRect.left + window.scrollX,
        width: containerRect.width,
      });
    }
  }, [showPredictions]);

  // Handle window scroll and resize
  useEffect(() => {
    const updatePosition = () => {
      if (showPredictions && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const inputContainer = inputRef.current.closest(
          'div[class*="relative flex items-center"]'
        );
        const containerRect = inputContainer?.getBoundingClientRect() || rect;

        setDropdownPosition({
          top: containerRect.bottom + window.scrollY + 4,
          left: containerRect.left + window.scrollX,
          width: containerRect.width,
        });
      }
    };

    if (showPredictions) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [showPredictions]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Input Field */}
        <div
          className={`relative flex items-center border rounded-xl transition-colors ${
            validationStatus === "valid"
              ? "border-green-500 bg-green-50"
              : validationStatus === "invalid"
              ? "border-red-500 bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400 focus-within:border-blue-500"
          }`}
        >
          <div className="flex items-center pl-4">
            {isLoading || isValidating ? (
              <Loader2 className="text-gray-400 animate-spin" size={20} />
            ) : (
              <Search className="text-gray-400" size={20} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={isLoading ? "Loading..." : placeholder}
            disabled={isLoading || !isLoaded}
            required={required}
            className="flex-1 px-3 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-500 disabled:cursor-not-allowed"
          />

          {/* Status Icons */}
          <div className="flex items-center pr-3 space-x-2">
            {validationStatus === "valid" && (
              <CheckCircle className="text-green-500" size={20} />
            )}
            {validationStatus === "invalid" && (
              <AlertCircle className="text-red-500" size={20} />
            )}
            {searchValue && (
              <button
                type="button"
                onClick={clearInput}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Validation Message */}
        {validationStatus === "invalid" &&
          selectedAddress &&
          !selectedAddress.isInDeliveryArea && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle size={14} />
              <span>This address is outside our delivery area</span>
            </p>
          )}

        {validationStatus === "valid" && selectedAddress && (
          <p className="mt-1 text-sm text-green-600 flex items-center space-x-1">
            <CheckCircle size={14} />
            <span>Address verified</span>
          </p>
        )}

        {/* Loading state for Maps API */}
        {!isLoaded && (
          <p className="mt-1 text-sm text-gray-500 flex items-center space-x-1">
            <Loader2 size={14} className="animate-spin" />
            <span>Loading address validation...</span>
          </p>
        )}

        {/* Predictions Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg z-[9999] max-h-64 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <button
                key={prediction.place_id || index}
                type="button"
                onClick={() => handlePredictionSelect(prediction)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="flex items-start space-x-3">
                  <MapPin
                    className="text-gray-400 mt-0.5 flex-shrink-0"
                    size={16}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 text-sm font-medium truncate">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Address Details */}
      {selectedAddress && validationStatus === "valid" && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPin className="text-gray-500 mt-0.5 flex-shrink-0" size={16} />
            <div className="min-w-0 flex-1">
              <p className="text-gray-900 text-sm font-medium">
                {selectedAddress.formattedAddress}
              </p>
              {selectedAddress.components && (
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                  {selectedAddress.components.city && (
                    <span className="bg-gray-200 px-2 py-1 rounded">
                      {selectedAddress.components.city}
                    </span>
                  )}
                  {selectedAddress.components.postalCode && (
                    <span className="bg-gray-200 px-2 py-1 rounded">
                      {selectedAddress.components.postalCode}
                    </span>
                  )}
                  {selectedAddress.components.country && (
                    <span className="bg-gray-200 px-2 py-1 rounded">
                      {selectedAddress.components.country}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
