"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function RestaurantsAndFeatures() {
  const [restaurants, setRestaurants] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch restaurants and features data
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch restaurants data
        const restaurantsResponse = await fetch("/api/restaurants");
        const restaurantsData = await restaurantsResponse.json();

        // Fetch features data
        const featuresResponse = await fetch("/api/features");
        const featuresData = await featuresResponse.json();

        setRestaurants(restaurantsData);
        setFeatures(featuresData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to default data if API fails
        setRestaurants(getDefaultRestaurants());
        setFeatures(getDefaultFeatures());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback default data
  const getDefaultRestaurants = () => [
    {
      id: 1,
      name: "McDonald's",
      logo: "🍟",
      logoImage: "/restaurant-logos/mc-donalds.jpg", 
      backgroundColor: "#DC2626",
      isActive: true,
      category: "fast-food",
    },
    {
      id: 2,
      name: "KFC",
      logo: "🍗",
      backgroundColor: "#DC2626",
      isActive: true,
      category: "fast-food",
    },
    {
      id: 3,
      name: "Burger King",
      logo: "🍔",
      backgroundColor: "#2563EB",
      isActive: true,
      category: "fast-food",
    },
    {
      id: 4,
      name: "Pizza Hut",
      logo: "🍕",
      backgroundColor: "#DC2626",
      isActive: true,
      category: "pizza",
    },
    {
      id: 5,
      name: "Subway",
      logo: "🥪",
      backgroundColor: "#059669",
      isActive: true,
      category: "sandwiches",
    },
    {
      id: 6,
      name: "Taco Bell",
      logo: "🌮",
      backgroundColor: "#7C3AED",
      isActive: true,
      category: "mexican",
    },
    {
      id: 7,
      name: "Starbucks",
      logo: "☕",
      backgroundColor: "#059669",
      isActive: true,
      category: "coffee",
    },
    {
      id: 8,
      name: "Domino's",
      logo: "🍕",
      backgroundColor: "#2563EB",
      isActive: true,
      category: "pizza",
    },
  ];

  const getDefaultFeatures = () => [
    {
      id: 1,
      title: "Your city's top restaurants",
      description:
        "With a great variety of restaurants you can order your favourite food or explore new restaurants nearby!",
      icon: "🍽️",
      backgroundColor: "#FBBF24",
      isActive: true,
    },
    {
      id: 2,
      title: "Fast delivery",
      description:
        "Like a flash! Order or send anything in your city and receive it in minutes",
      icon: "⚡",
      backgroundColor: "#60A5FA",
      isActive: true,
    },
    {
      id: 3,
      title: "Groceries delivery & more",
      description:
        "Find anything you need! From supermarkets to shops, pharmacies to florists — if it's in your city order it and receive it.",
      icon: "🛒",
      backgroundColor: "#34D399",
      isActive: true,
    },
  ];

  // Convert hex color to Tailwind classes (fallback for dynamic colors)
  const getBackgroundColorClass = (hexColor) => {
    const colorMap = {
      "#DC2626": "bg-red-600",
      "#2563EB": "bg-blue-600",
      "#059669": "bg-green-600",
      "#7C3AED": "bg-purple-600",
      "#FBBF24": "bg-yellow-400",
      "#60A5FA": "bg-blue-400",
      "#34D399": "bg-green-400",
    };
    return colorMap[hexColor] || "bg-gray-500";
  };

  if (loading) {
    return (
      <>
        {/* Loading skeleton for restaurants */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="h-10 bg-gray-200 rounded mx-auto w-96 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Loading skeleton for features */}
        <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-yellow-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto lg:mx-0 mb-6 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Dynamic Restaurants Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top restaurants and more in ST PIZZA
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {restaurants
              .filter((restaurant) => restaurant.isActive)
              .slice(0, 8) // Limit to 8 restaurants
              .map((restaurant, index) => {
                const blobShapes = [
                  "blob-shape-1",
                  "blob-shape-2",
                  "blob-shape-3",
                  "blob-shape-4",
                  "blob-shape-5",
                  "blob-shape-6",
                  "blob-shape-7",
                  "blob-shape-8",
                ];
                const blobShape = blobShapes[index % blobShapes.length];

                return (
                  <div
                    key={restaurant.id}
                    className="text-center group cursor-pointer"
                  >
                    <div
                      className={`w-16 h-16 ${blobShape} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-300 shadow-lg relative overflow-hidden`}
                      style={{ backgroundColor: restaurant.backgroundColor }}
                    >
                      {/* Use logo image if available, otherwise fallback to emoji */}
                      {restaurant.logoImage ? (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <Image
                            src={restaurant.logoImage}
                            alt={restaurant.name}
                            width={28}
                            height={28}
                            className="object-contain z-10 relative drop-shadow-sm"
                          />
                        </div>
                      ) : (
                        <span className="text-xl z-10 relative drop-shadow-sm filter">
                          {restaurant.logo}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {restaurant.name}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Dynamic Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {features
              .filter((feature) => feature.isActive)
              .slice(0, 3) // Limit to 3 features
              .map((feature) => (
                <div key={feature.id} className="text-center lg:text-left">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 ${getBackgroundColorClass(
                      feature.backgroundColor
                    )}`}
                    style={{ backgroundColor: feature.backgroundColor }}
                  >
                    {/* Use icon image if available, otherwise fallback to emoji */}
                    {feature.iconImage ? (
                      <Image
                        src={feature.iconImage}
                        alt={feature.title}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-3xl">{feature.icon}</span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
