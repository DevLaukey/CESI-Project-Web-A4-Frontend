"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Loader,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";

const DriverMap = ({
  driverLocation,
  deliveries = [],
  currentDelivery = null,
}) => {
  const [location, setLocation] = useState(null);
  const [zoom, setZoom] = useState(13);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
    // Set default location after client mount
    setLocation(driverLocation || { lat: 49.4144, lng: 1.097 });

    // Load Leaflet dynamically
    loadLeaflet();
  }, []);

  // Update location when driverLocation changes
  useEffect(() => {
    if (driverLocation && isClient) {
      setLocation(driverLocation);
    }
  }, [driverLocation, isClient]);

  // Handle map loading after Leaflet is loaded
  useEffect(() => {
    if (isClient && leafletLoaded && location) {
      const timer = setTimeout(() => {
        initializeMap();
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isClient, leafletLoaded, location]);

  const loadLeaflet = async () => {
    if (typeof window === "undefined") return;

    try {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!window.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // Fix default icon paths
        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
      }

      setLeafletLoaded(true);
    } catch (error) {
      console.error("Failed to load Leaflet:", error);
      setMapError(true);
    }
  };

  const initializeMap = () => {
    if (!window.L || !mapContainerRef.current || !location) return;

    try {
      // Clear existing map if any
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Create new map
      const map = window.L.map(mapContainerRef.current, {
        center: [location.lat, location.lng],
        zoom: zoom,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      // Add tile layer
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add driver marker
      const driverIcon = createCustomIcon("driver");
      if (driverIcon) {
        window.L.marker([location.lat, location.lng], {
          icon: driverIcon,
        }).addTo(map).bindPopup(`
            <div class="text-center p-2">
              <div class="flex items-center gap-2 mb-2">
                <strong class="text-gray-800">Your Location</strong>
              </div>
              <p class="text-sm text-gray-600">
                Lat: ${location.lat.toFixed(4)}<br />
                Lng: ${location.lng.toFixed(4)}
              </p>
              <div class="mt-2 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                Driver Position
              </div>
            </div>
          `);
      }

      // Add current delivery marker
      if (currentDelivery) {
        const currentIcon = createCustomIcon("current");
        if (currentIcon) {
          window.L.marker(
            [
              currentDelivery.lat || location.lat + 0.005,
              currentDelivery.lng || location.lng + 0.005,
            ],
            { icon: currentIcon }
          ).addTo(map).bindPopup(`
              <div class="min-w-48 p-2">
                <div class="flex items-center gap-2 mb-3">
                  <strong class="text-gray-800">${currentDelivery.restaurant}</strong>
                </div>
                <div class="space-y-2 text-sm">
                  <p class="text-gray-600">
                    <span class="font-medium">Customer:</span> ${currentDelivery.customer}
                  </p>
                  <p class="text-gray-600">
                    <span class="font-medium">Address:</span> ${currentDelivery.address}
                  </p>
                </div>
                <div class="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                  <span class="text-lg font-bold text-green-600">
                    ${currentDelivery.earnings}
                  </span>
                  <span class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                    Active Delivery
                  </span>
                </div>
              </div>
            `);
        }
      }

      // Add delivery markers
      if (deliveries && deliveries.length > 0) {
        const deliveryIcon = createCustomIcon("delivery");
        if (deliveryIcon) {
          deliveries.forEach((delivery, index) => {
            window.L.marker(
              [
                delivery.lat || location.lat + (Math.random() - 0.5) * 0.01,
                delivery.lng || location.lng + (Math.random() - 0.5) * 0.01,
              ],
              { icon: deliveryIcon }
            ).addTo(map).bindPopup(`
                <div class="min-w-48 p-2">
                  <div class="flex items-center gap-2 mb-3">
                    <strong class="text-gray-800">${delivery.restaurant}</strong>
                  </div>
                  <div class="space-y-2 text-sm">
                    <p class="text-gray-600">
                      <span class="font-medium">Customer:</span> ${delivery.customer}
                    </p>
                    <p class="text-gray-600">
                      <span class="font-medium">Address:</span> ${delivery.address}
                    </p>
                  </div>
                  <div class="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    <span class="text-lg font-bold text-green-600">
                      ${delivery.earnings}
                    </span>
                    <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      ${delivery.distance}
                    </span>
                  </div>
                </div>
              `);
          });
        }
      }

      mapRef.current = map;

      // Update zoom when map zoom changes
      map.on("zoomend", () => {
        setZoom(map.getZoom());
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setMapError(true);
    }
  };

  // Custom icon creation function
  const createCustomIcon = (type = "driver") => {
    if (!window.L) return null;

    const iconConfigs = {
      driver: {
        iconUrl:
          "data:image/svg+xml;base64," +
          btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#3B82F6" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
            <circle cx="16" cy="8" r="2" fill="white"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      },
      delivery: {
        iconUrl:
          "data:image/svg+xml;base64," +
          btoa(`
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="12" fill="#EF4444" stroke="white" stroke-width="2"/>
            <path d="M10 14L13 17L18 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      },
      current: {
        iconUrl:
          "data:image/svg+xml;base64," +
          btoa(`
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="13" fill="#F59E0B" stroke="white" stroke-width="2"/>
            <path d="M15 8L18 14H17V20H13V14H12L15 8Z" fill="white"/>
          </svg>
        `),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      },
    };

    return new window.L.Icon(iconConfigs[type]);
  };

  // Center map on location
  const centerOnLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.setView([location.lat, location.lng], 15);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const newZoom = Math.min(currentZoom + 1, 18);
      mapRef.current.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const newZoom = Math.max(currentZoom - 1, 3);
      mapRef.current.setZoom(newZoom);
      setZoom(newZoom);
    }
  };

  // Update map when location changes
  useEffect(() => {
    if (mapRef.current && location && leafletLoaded) {
      mapRef.current.setView(
        [location.lat, location.lng],
        mapRef.current.getZoom()
      );
    }
  }, [location, leafletLoaded]);

  // Don't render anything until client-side
  if (!isClient || !location) {
    return (
      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm font-medium">
            Initializing map...
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !leafletLoaded) {
    return (
      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (mapError) {
    return (
      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gray-50 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-3 font-medium">Unable to load map</p>
          <button
            onClick={() => {
              setMapError(false);
              setIsLoading(true);
              setLeafletLoaded(false);
              loadLeaflet();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Map Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Navigation className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Live Location</h3>
                <p className="text-sm text-gray-600">
                  Real-time tracking active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96">
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ zIndex: 1 }}
          />

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={centerOnLocation}
              className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
              title="Center on my location"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={zoomIn}
              className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
              title="Zoom in"
            >
              <Plus className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={zoomOut}
              className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
              title="Zoom out"
            >
              <Minus className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Mobile-friendly zoom level indicator */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-black/75 text-white px-2 py-1 rounded text-xs font-mono">
            Zoom: {zoom}
          </div>
        </div>

        {/* Map Footer with Legend */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full border border-white shadow-sm"></div>
                <span className="text-gray-600 font-medium">Your Location</span>
              </div>
              {currentDelivery && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full border border-white shadow-sm"></div>
                  <span className="text-gray-600 font-medium">
                    Active Delivery
                  </span>
                </div>
              )}
              {deliveries && deliveries.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm"></div>
                  <span className="text-gray-600 font-medium">
                    Available ({deliveries.length})
                  </span>
                </div>
              )}
            </div>
            {location && (
              <div className="text-xs text-gray-500 font-mono">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverMap;
  