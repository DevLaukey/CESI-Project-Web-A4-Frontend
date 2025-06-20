"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Search, X, Check, Loader2 } from "lucide-react";

// Google Maps configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["places", "geometry"],
};

// Default map center (Paris, France - adjust based on your service area)
const DEFAULT_CENTER = {
  lat: 48.8566,
  lng: 2.3522,
};

const DEFAULT_ZOOM = 13;

export default function GoogleMapsAddressPicker({
  onAddressSelect,
  initialAddress = null,
  placeholder = "Enter delivery address...",
  className = "",
  deliveryRadius = 10000, // 10km in meters
  restaurantLocation = null, // Restaurant location for delivery radius check
}) {
  // State management
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [isWithinDeliveryRadius, setIsWithinDeliveryRadius] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);

  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!GOOGLE_MAPS_CONFIG.apiKey) {
          throw new Error("Google Maps API key is not configured");
        }

        const loader = new Loader(GOOGLE_MAPS_CONFIG);
        await loader.load();

        // Initialize geocoder
        geocoderRef.current = new window.google.maps.Geocoder();

        // Initialize map
        if (mapRef.current) {
          const mapOptions = {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          };

          mapInstanceRef.current = new window.google.maps.Map(
            mapRef.current,
            mapOptions
          );

          // Add click listener to map
          mapInstanceRef.current.addListener("click", handleMapClick);

          // If there's an initial address, set it
          if (initialAddress) {
            await handleAddressSelection(initialAddress);
          }
        }

        setIsLoaded(true);
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGoogleMaps();

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle map click
  const handleMapClick = useCallback(async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    try {
      const address = await reverseGeocode(lat, lng);
      if (address) {
        await handleAddressSelection(address);
      }
    } catch (err) {
      console.error("Error handling map click:", err);
    }
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (lat, lng) => {
    return new Promise((resolve, reject) => {
      if (!geocoderRef.current) {
        reject(new Error("Geocoder not initialized"));
        return;
      }

      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const result = results[0];
            const addressComponents = parseAddressComponents(
              result.address_components
            );

            resolve({
              placeId: result.place_id,
              formattedAddress: result.formatted_address,
              geometry: {
                location: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                },
              },
              addressComponents,
            });
          } else {
            reject(new Error("Unable to find address for this location"));
          }
        }
      );
    });
  }, []);

  // Parse Google Maps address components
  const parseAddressComponents = (components) => {
    const addressMap = {};

    components.forEach((component) => {
      const types = component.types;
      if (types.includes("street_number")) {
        addressMap.streetNumber = component.long_name;
      }
      if (types.includes("route")) {
        addressMap.street = component.long_name;
      }
      if (types.includes("locality")) {
        addressMap.city = component.long_name;
      }
      if (types.includes("postal_code")) {
        addressMap.postalCode = component.long_name;
      }
      if (types.includes("country")) {
        addressMap.country = component.long_name;
        addressMap.countryCode = component.short_name;
      }
      if (types.includes("administrative_area_level_1")) {
        addressMap.state = component.long_name;
      }
    });

    return addressMap;
  };

  // Handle search input change with new API
  const handleSearchChange = useCallback(
    async (value) => {
      setSearchValue(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (value.length < 3) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      if (!isLoaded || !window.google?.maps?.places) return;

      // Debounce the search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const request = {
            input: value,
            includedPrimaryTypes: ["address"],
            includedRegionCodes: ["FR"], // Adjust based on your service area
            languageCode: "en",
          };

          // Use the new AutocompleteSuggestion API
          const { suggestions } =
            await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
              request
            );

          if (suggestions && suggestions.length > 0) {
            // Transform suggestions to match our expected format
            const transformedPredictions = suggestions.map((suggestion) => ({
              place_id: suggestion.placePrediction.placeId,
              description: suggestion.placePrediction.text.text,
              structured_formatting: {
                main_text:
                  suggestion.placePrediction.structuredFormat.mainText.text,
                secondary_text:
                  suggestion.placePrediction.structuredFormat.secondaryText
                    ?.text || "",
              },
            }));

            setPredictions(transformedPredictions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        } catch (error) {
          console.error("Error getting autocomplete suggestions:", error);
          setPredictions([]);
          setShowPredictions(false);
        }
      }, 300);
    },
    [isLoaded]
  );

  // Handle prediction selection
  const handlePredictionSelect = useCallback(async (prediction) => {
    setShowPredictions(false);
    setSearchValue(prediction.description);

    try {
      const placeDetails = await getPlaceDetails(prediction.place_id);
      if (placeDetails) {
        await handleAddressSelection(placeDetails);
      }
    } catch (err) {
      console.error("Error getting place details:", err);
    }
  }, []);

  // Get place details using new Places API
  const getPlaceDetails = useCallback(async (placeId) => {
    if (!window.google?.maps?.places?.Place) {
      throw new Error("Places API not loaded");
    }

    try {
      const place = new window.google.maps.places.Place({
        id: placeId,
        requestedLanguage: "en",
      });

      await place.fetchFields([
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "addressComponents",
      ]);

      const addressComponents = parseAddressComponents(
        place.addressComponents || []
      );

      return {
        placeId: place.id,
        formattedAddress: place.formattedAddress,
        geometry: {
          location: {
            lat: place.location.lat(),
            lng: place.location.lng(),
          },
        },
        addressComponents,
      };
    } catch (error) {
      console.error("Error fetching place details:", error);
      throw new Error("Unable to get place details");
    }
  }, []);

  // Check if address is within delivery radius
  const checkDeliveryRadius = useCallback(
    (addressLocation) => {
      if (!restaurantLocation || !window.google?.maps?.geometry) return true;

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

  // Handle address selection
  const handleAddressSelection = useCallback(
    async (address) => {
      setSelectedAddress(address);
      setSearchValue(address.formattedAddress);

      // Check delivery radius
      if (restaurantLocation) {
        const withinRadius = checkDeliveryRadius(address.geometry.location);
        setIsWithinDeliveryRadius(withinRadius);
      }

      // Update map
      if (mapInstanceRef.current) {
        const location = new window.google.maps.LatLng(
          address.geometry.location.lat,
          address.geometry.location.lng
        );

        // Center map on selected location
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(16);

        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // Add new marker
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: address.formattedAddress,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: isWithinDeliveryRadius ? "#10B981" : "#EF4444",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          },
        });
      }

      // Call parent callback
      if (onAddressSelect) {
        onAddressSelect({
          ...address,
          isWithinDeliveryRadius: restaurantLocation
            ? checkDeliveryRadius(address.geometry.location)
            : true,
        });
      }
    },
    [onAddressSelect, restaurantLocation, checkDeliveryRadius]
  );

  // Clear selection
  const clearSelection = () => {
    setSelectedAddress(null);
    setSearchValue("");
    setIsWithinDeliveryRadius(true);
    setShowPredictions(false);

    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(DEFAULT_CENTER);
      mapInstanceRef.current.setZoom(DEFAULT_ZOOM);
    }

    if (onAddressSelect) {
      onAddressSelect(null);
    }
  };

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center space-x-2 text-red-700">
          <X size={20} />
          <span className="font-medium">Error loading map</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 outline-none text-gray-900 placeholder-gray-500"
            />
            {selectedAddress && (
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Search Predictions */}
          {showPredictions && predictions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePredictionSelect(prediction)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <p className="text-gray-900 text-sm">
                        {prediction.structured_formatting.main_text}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {prediction.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Status */}
        {selectedAddress && restaurantLocation && (
          <div className="mt-3">
            <div
              className={`flex items-center space-x-2 text-sm ${
                isWithinDeliveryRadius ? "text-green-700" : "text-red-700"
              }`}
            >
              {isWithinDeliveryRadius ? <Check size={16} /> : <X size={16} />}
              <span>
                {isWithinDeliveryRadius
                  ? "Address is within delivery area"
                  : "Address is outside delivery area"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2
                size={32}
                className="animate-spin text-gray-400 mx-auto mb-2"
              />
              <p className="text-gray-600 text-sm">Loading map...</p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-96"
          style={{ minHeight: "384px" }}
        />
      </div>

      {/* Selected Address Info */}
      {selectedAddress && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <MapPin className="text-gray-500 mt-0.5" size={16} />
            <div>
              <p className="text-gray-900 text-sm font-medium">
                Selected Address
              </p>
              <p className="text-gray-600 text-sm">
                {selectedAddress.formattedAddress}
              </p>
              {selectedAddress.addressComponents && (
                <div className="mt-2 text-xs text-gray-500">
                  {selectedAddress.addressComponents.city && (
                    <span className="mr-3">
                      City: {selectedAddress.addressComponents.city}
                    </span>
                  )}
                  {selectedAddress.addressComponents.postalCode && (
                    <span>
                      Postal: {selectedAddress.addressComponents.postalCode}
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
