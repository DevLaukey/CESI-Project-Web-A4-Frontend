"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [address, setAddress] = useState("");
  const [animationData, setAnimationData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [hasStoredLocation, setHasStoredLocation] = useState(false);

  const router = useRouter();

  const carouselData = [
    {
      id: 1,
      title: "Pizza delivery in minutes!",
      subtitle: "Your favorite pizza, delivered hot and fresh",
      bgColor: "from-yellow-400 to-orange-400",
      lottieFile: "/animations/food_order.json",
      fallbackEmoji: "🍕",
    },
    {
      id: 2,
      title: "Groceries & more",
      subtitle: "Everything you need from local stores",
      bgColor: "from-teal-400 to-teal-500",
      lottieFile: "/animations/groccery.json",
      fallbackEmoji: "🛒",
    },
    {
      id: 3,
      title: "Fast delivery",
      subtitle: "Like a flash! Order anything in your city",
      bgColor: "from-blue-400 to-purple-400",
      lottieFile: "/animations/delivery.json",
      fallbackEmoji: "⚡",
    },
  ];

  // Check for existing location on mount
  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      try {
        const locationData = JSON.parse(storedLocation);
        setAddress(locationData.address);
        setHasStoredLocation(true);
      } catch (error) {
        console.error("Error parsing stored location:", error);
        localStorage.removeItem("userLocation");
      }
    }
  }, []);

  // Load Lottie animations
  useEffect(() => {
    const loadAnimations = async () => {
      const animations = {};

      try {
        for (const slide of carouselData) {
          try {
            const response = await fetch(slide.lottieFile);
            if (response.ok) {
              const data = await response.json();
              animations[slide.id] = data;
              console.log(
                `Successfully loaded animation for slide ${slide.id}`
              );
            } else {
              console.warn(
                `Failed to fetch animation for slide ${slide.id}: ${response.status}`
              );
              animations[slide.id] = null;
            }
          } catch (error) {
            console.error(
              `Error loading animation for slide ${slide.id}:`,
              error
            );
            animations[slide.id] = null;
          }
        }
      } catch (error) {
        console.error("Error in animation loading process:", error);
      }

      setAnimationData(animations);
      setIsLoading(false);
    };

    loadAnimations();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselData.length]);

  // Validate address format
  const validateAddress = (addr) => {
    if (!addr || addr.trim().length < 10) {
      return "Please enter a complete address (street, city, etc.)";
    }

    // Basic address validation - should contain letters and numbers
    const hasLetters = /[a-zA-Z]/.test(addr);
    const hasNumbers = /[0-9]/.test(addr);

    if (!hasLetters) {
      return "Address should contain street names";
    }

    return null; // Valid
  };

  const handleLocationRequest = () => {
    setIsSubmitting(true);
    setAddressError("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const simulatedAddress = `${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)} (Detected Location)`;

            // Store location data
            const locationData = {
              address: simulatedAddress,
              coordinates: { latitude, longitude },
              timestamp: new Date().toISOString(),
              isDetected: true,
            };

            localStorage.setItem("userLocation", JSON.stringify(locationData));
            setAddress(simulatedAddress);
            setHasStoredLocation(true);

            // Auto-redirect to restaurants after getting location
            setTimeout(() => {
              router.push("/restaurants");
            }, 1000);
          } catch (error) {
            console.error("Error processing location:", error);
            setAddressError("Failed to process location. Please try again.");
          } finally {
            setIsSubmitting(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Unable to get location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enter address manually.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information unavailable. Please enter address manually.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }

          setAddressError(errorMessage);
          setIsSubmitting(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      setAddressError("Geolocation is not supported by this browser.");
      setIsSubmitting(false);
    }
  };

  const handleAddressSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setAddressError("");

    const trimmedAddress = address.trim();
    const validationError = validateAddress(trimmedAddress);

    if (validationError) {
      setAddressError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const locationData = {
        address: trimmedAddress,
        coordinates: null, // Would be filled by geocoding
        timestamp: new Date().toISOString(),
        isDetected: false,
      };

      localStorage.setItem("userLocation", JSON.stringify(locationData));
      setHasStoredLocation(true);

      // Show success feedback
      console.log("Address saved:", trimmedAddress);

      // Redirect to restaurants page
      router.push("/restaurants");
    } catch (error) {
      console.error("Error saving address:", error);
      setAddressError("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleAddressSubmit();
    }
  };

  const handleBrowseRestaurants = () => {
    if (hasStoredLocation) {
      router.push("/restaurants");
    } else {
      setAddressError(
        "Please enter your address first to see available restaurants."
      );
    }
  };

  const clearAddress = () => {
    setAddress("");
    setHasStoredLocation(false);
    setAddressError("");
    localStorage.removeItem("userLocation");
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Carousel */}
      {carouselData.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`h-full bg-gradient-to-br ${slide.bgColor} relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-24 sm:w-48 h-24 sm:h-48 bg-white rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/4 w-16 sm:w-32 h-16 sm:h-32 bg-white rounded-full blur-xl"></div>
              <div className="absolute top-1/3 right-1/3 w-10 sm:w-20 h-10 sm:h-20 bg-white rounded-full blur-lg"></div>
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-2 sm:w-4 h-2 sm:h-4 bg-white rounded-full animate-ping opacity-20"></div>
              <div className="absolute top-1/4 right-10 sm:right-20 w-2 sm:w-3 h-2 sm:h-3 bg-white rounded-full animate-pulse opacity-30"></div>
              <div className="absolute bottom-1/4 left-1/3 w-1 sm:w-2 h-1 sm:h-2 bg-white rounded-full animate-bounce opacity-25"></div>
            </div>
          </div>
        </div>
      ))}

      {/* Static Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Animated Text Content */}
              <div className="relative min-h-[250px] sm:min-h-[300px] mb-8 lg:mb-0">
                {carouselData.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`transition-all duration-1000 ease-in-out ${
                      index === currentSlide
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 absolute inset-0"
                    }`}
                  >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 drop-shadow-md leading-relaxed">
                      {slide.subtitle}
                    </p>
                  </div>
                ))}
              </div>

              {/* Address Input Section */}
              <div className="max-w-lg mx-auto lg:mx-0 mt-6 sm:mt-8">
                {/* Success State - When address is set */}
                {hasStoredLocation ? (
                  <div className="space-y-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/40">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-green-700 font-semibold text-sm sm:text-base">
                          Delivery location set!
                        </span>
                      </div>

                      <div className="flex items-start gap-3 mb-6">
                        <svg
                          className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
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
                        <span className="text-gray-700 text-sm sm:text-base break-words leading-relaxed">
                          {address}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleBrowseRestaurants}
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                        >
                          Browse Restaurants
                        </button>
                        <button
                          onClick={clearAddress}
                          className="sm:flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl sm:rounded-2xl transition-all duration-300 font-medium text-sm sm:text-base"
                        >
                          Change Location
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Address Input State */
                  <div className="space-y-4">
                    {/* Main Input Container */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
                      {/* Desktop Layout */}
                      <div className="hidden sm:block p-3">
                        <div className="flex items-center bg-white/50 rounded-2xl">
                          <div className="flex-1 flex items-center">
                            <svg
                              className="w-6 h-6 text-gray-400 ml-4 mr-3 flex-shrink-0"
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
                              placeholder="Enter delivery address (e.g., 123 Main St, City)"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              onKeyPress={handleKeyPress}
                              disabled={isSubmitting}
                              className="flex-1 py-4 px-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent font-medium text-base"
                            />
                          </div>
                          <button
                            onClick={handleAddressSubmit}
                            disabled={!address.trim() || isSubmitting}
                            className={`ml-3 mr-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${
                              address.trim() && !isSubmitting
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 hover:scale-105 hover:shadow-lg"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                <span>Finding...</span>
                              </div>
                            ) : (
                              "Find Restaurants"
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="block sm:hidden p-4 space-y-4">
                        <div className="flex items-center bg-white/50 rounded-xl p-3">
                          <svg
                            className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
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
                            placeholder="Enter your delivery address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isSubmitting}
                            className="flex-1 py-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent font-medium text-sm"
                          />
                        </div>
                        <button
                          onClick={handleAddressSubmit}
                          disabled={!address.trim() || isSubmitting}
                          className={`w-full py-4 rounded-xl font-bold transition-all duration-300 text-sm ${
                            address.trim() && !isSubmitting
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 hover:scale-105 shadow-lg"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                              <span>Finding Restaurants...</span>
                            </div>
                          ) : (
                            "Find Restaurants"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {addressError && (
                      <div className="bg-red-100/95 backdrop-blur-sm border border-red-300 text-red-700 px-4 py-3 rounded-xl shadow-lg">
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm leading-relaxed">
                            {addressError}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Current Location Button */}
                    <button
                      onClick={handleLocationRequest}
                      disabled={isSubmitting}
                      className="w-full bg-white/25 hover:bg-white/35 backdrop-blur-sm text-white border-2 border-white/40 hover:border-white/60 font-medium py-3 sm:py-4 px-4 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg text-sm sm:text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Detecting location...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
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
                          </svg>
                          <span>📍 Use current location</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Animation */}
            <div className="order-1 lg:order-2 flex justify-center mb-8 lg:mb-0">
              {/* Desktop Animation */}
              <div className="hidden lg:flex justify-center">
                <div className="w-80 h-80 xl:w-96 xl:h-96 bg-white/20 rounded-full flex items-center justify-center relative backdrop-blur-sm border border-white/30 shadow-2xl">
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Lottie Animations */}
                  {carouselData.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute transition-all duration-1000 ease-in-out ${
                        index === currentSlide
                          ? "opacity-100 scale-100 rotate-0"
                          : "opacity-0 scale-75 rotate-12"
                      }`}
                    >
                      {!isLoading && (
                        <>
                          {animationData[slide.id] ? (
                            <Lottie
                              animationData={animationData[slide.id]}
                              loop={true}
                              autoplay={true}
                              style={{
                                width: "260px",
                                height: "260px",
                              }}
                            />
                          ) : (
                            // Enhanced fallback with animations
                            <div className="relative flex items-center justify-center">
                              <span className="text-7xl xl:text-8xl animate-bounce filter drop-shadow-lg">
                                {slide.fallbackEmoji}
                              </span>
                              {/* Ripple effect */}
                              <div className="absolute inset-0 animate-ping">
                                <div className="w-full h-full bg-white/10 rounded-full"></div>
                              </div>
                              {/* Pulse effect */}
                              <div className="absolute inset-0 animate-pulse">
                                <div className="w-full h-full bg-white/5 rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}

                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/4 -left-6 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Mobile/Tablet Animation */}
              <div className="flex lg:hidden justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white/20 rounded-full flex items-center justify-center relative backdrop-blur-sm border border-white/30 shadow-xl">
                  {carouselData.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute transition-all duration-1000 ease-in-out ${
                        index === currentSlide
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75"
                      }`}
                    >
                      {!isLoading && (
                        <>
                          {animationData[slide.id] ? (
                            <Lottie
                              animationData={animationData[slide.id]}
                              loop={true}
                              autoplay={true}
                              style={{
                                width: "140px",
                                height: "140px",
                              }}
                              className="sm:w-48 sm:h-48"
                            />
                          ) : (
                            <span className="text-5xl sm:text-6xl animate-bounce filter drop-shadow-lg">
                              {slide.fallbackEmoji}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Carousel Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
        {carouselData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-6 sm:w-8 h-2 sm:h-3 bg-white shadow-lg"
                : "w-2 sm:w-3 h-2 sm:h-3 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
