"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Star,
  Clock,
  Truck,
  ChevronRight,
  MapPin,
  Heart,
  ChevronLeft,
  Phone,
  Mail,
} from "lucide-react";
import { customerAPI } from "@/libs/api";
import FloatingCart from "@/components/layout/FloatingCart"; 
import { CartContext } from "@/data/CartContext";

function BrowseRestaurants() {
  const router = useRouter();
  const { cartProducts } = useContext(CartContext);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState(new Set());
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    minRating: null,
  });

  // Food categories with emojis
  const categories = [
    { name: "All", emoji: "🍽️" },
    { name: "Italian", emoji: "🍝" },
    { name: "French", emoji: "🥖" },
    { name: "Asian", emoji: "🍜" },
    { name: "Indian", emoji: "🍛" },
    { name: "Pizza", emoji: "🍕" },
    { name: "Sushi", emoji: "🍣" },
    { name: "Fast Food", emoji: "🍟" },
    { name: "Desserts", emoji: "🧁" },
    { name: "Burgers", emoji: "🍔" },
    { name: "Healthy", emoji: "🥗" },
    { name: "Bubble Tea", emoji: "🧋" },
    { name: "Korean", emoji: "🥟" },
    { name: "Halal", emoji: "🥘" },
    { name: "American", emoji: "🇺🇸" },
    { name: "Japanese", emoji: "🍱" },
    { name: "Turkish", emoji: "🇹🇷" },
  ];

  useEffect(() => {
    fetchRestaurants();
    loadUserLocation();
    loadFavorites();
  }, []);

  const loadUserLocation = () => {
    try {
      const storedLocation = sessionStorage.getItem("userLocation");
      if (storedLocation) {
        const locationData = JSON.parse(storedLocation);
        setUserLocation(locationData);
      } else {
        setUserLocation({
          formattedAddress: "Paris, France",
          city: "Paris",
          country: "France",
        });
      }
    } catch (error) {
      console.error("Error loading user location:", error);
      setUserLocation({
        formattedAddress: "Paris, France",
        city: "Paris",
        country: "France",
      });
    }
  };

  const loadFavorites = () => {
    try {
      const storedFavorites = sessionStorage.getItem("favoriteRestaurants");
      if (storedFavorites) {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const saveFavorites = (newFavorites) => {
    try {
      sessionStorage.setItem(
        "favoriteRestaurants",
        JSON.stringify([...newFavorites])
      );
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      console.log("Fetching restaurants...");

      const response = await customerAPI.getRestaurants();
      console.log("API Response:", response);

      let restaurantsData = [];
      if (Array.isArray(response)) {
        restaurantsData = response;
      } else if (response.restaurants && Array.isArray(response.restaurants)) {
        restaurantsData = response.restaurants;
      } else if (response.data && Array.isArray(response.data)) {
        restaurantsData = response.data;
      }

      setRestaurants(restaurantsData);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (restaurantUuid) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(restaurantUuid)) {
        newFavorites.delete(restaurantUuid);
      } else {
        newFavorites.add(restaurantUuid);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  // Helper function to check if restaurant is open
  const isRestaurantOpen = (restaurant) => {
    if (restaurant.isOpenNow !== undefined) {
      return restaurant.isOpenNow;
    }

    if (restaurant.isOpen !== undefined) {
      return restaurant.isOpen;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const todayHours = restaurant.openingHours?.[currentDay];
    if (!todayHours) return false;
    if (todayHours.isClosed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  // Helper function to format delivery time
  const formatDeliveryTime = (restaurant) => {
    if (restaurant.averageDeliveryTime) {
      return `${restaurant.averageDeliveryTime} min`;
    }
    return "30-45 min";
  };

  // Helper function to get restaurant image
  const getRestaurantImage = (restaurant) => {
    if (restaurant.bannerImage) return restaurant.bannerImage;
    if (restaurant.profileImage) return restaurant.profileImage;

    switch (restaurant.cuisineType?.toLowerCase()) {
      case "italian":
        return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop";
      case "french":
        return "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop";
      case "asian":
      case "japanese":
        return "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop";
      case "indian":
        return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop";
      case "american":
        return "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop";
      case "turkish":
        return "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop";
    }
  };

  // Client-side filtering
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      !searchQuery ||
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisineType
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      restaurant.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      restaurant.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" ||
      restaurant.cuisineType
        ?.toLowerCase()
        .includes(selectedCategory.toLowerCase()) ||
      restaurant.tags?.some((tag) =>
        tag.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    const matchesRating =
      !filters.minRating ||
      (restaurant.rating && parseFloat(restaurant.rating) >= filters.minRating);

    return matchesSearch && matchesCategory && matchesRating;
  });

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleRatingFilter = (minRating) => {
    setFilters((prev) => ({ ...prev, minRating }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setFilters({ minRating: null });
  };

  const handleRestaurantClick = (restaurantUuid) => {
    console.log("Navigate to restaurant:", restaurantUuid);
    router.push(`/restaurant-details/${restaurantUuid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex space-x-4 mb-6 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg"
                ></div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Restaurants
              </h1>
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {userLocation?.formattedAddress?.split(",")[0] ||
                    userLocation?.city ||
                    "Paris"}{" "}
                  • Now
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.name)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all ${
                  selectedCategory === category.name
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1">
                  {category.emoji}
                </span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
          <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border hover:bg-gray-50 whitespace-nowrap">
            <span>🎯</span>
            <span className="text-sm font-medium">Offers</span>
          </button>
          <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border hover:bg-gray-50 whitespace-nowrap">
            <span className="text-sm font-medium">Price</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border hover:bg-gray-50 whitespace-nowrap">
            <span className="text-sm font-medium">Delivery fee</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="relative">
            <select
              value={filters.minRating || ""}
              onChange={(e) =>
                handleRatingFilter(
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              className="appearance-none bg-white px-4 py-2 pr-8 rounded-full border hover:bg-gray-50 text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
            <Star className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
          <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border hover:bg-gray-50 whitespace-nowrap">
            <span className="text-sm font-medium">Sort</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {searchQuery
              ? `Results for "${searchQuery}" (${filteredRestaurants.length} found)`
              : `All Restaurants (${filteredRestaurants.length} available)`}
          </h2>
          {(searchQuery || selectedCategory !== "All" || filters.minRating) && (
            <button
              onClick={clearFilters}
              className="text-red-600 font-medium text-sm flex items-center space-x-1 hover:text-red-700"
            >
              <span>Clear filters</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Restaurant Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredRestaurants.map((restaurant) => {
            const isOpen = isRestaurantOpen(restaurant);
            const deliveryTime = formatDeliveryTime(restaurant);
            const restaurantImage = getRestaurantImage(restaurant);

            return (
              <div
                key={restaurant.uuid}
                onClick={() => handleRestaurantClick(restaurant.uuid)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={restaurantImage}
                    alt={restaurant.name}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop";
                    }}
                  />

                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${
                      isOpen
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </div>

                  {/* Verified Badge */}
                  {restaurant.isVerified && (
                    <div className="absolute top-3 left-16 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Verified
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(restaurant.uuid);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(restaurant.uuid)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight flex-1 mr-2">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm flex-shrink-0">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-xs sm:text-sm">
                        {parseFloat(restaurant.rating) > 0
                          ? parseFloat(restaurant.rating).toFixed(1)
                          : "4.5"}
                      </span>
                      <span className="text-gray-500 text-xs hidden sm:inline">
                        ({restaurant.reviewCount || 100})
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    {restaurant.cuisineType || "Restaurant"}
                  </p>

                  {restaurant.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">
                          {deliveryTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">
                          €{parseFloat(restaurant.deliveryFee).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{restaurant.city}</span>
                    {restaurant.minimumOrder &&
                      parseFloat(restaurant.minimumOrder) > 0 && (
                        <span>
                          Min. €{parseFloat(restaurant.minimumOrder).toFixed(2)}
                        </span>
                      )}
                  </div>

                  {/* Tags */}
                  {restaurant.tags && restaurant.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {restaurant.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredRestaurants.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {restaurants.length === 0
                ? "No restaurants available at the moment"
                : "Try adjusting your search or filter criteria"}
            </p>
            {restaurants.length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* FloatingCart Component - Always visible when cart has items */}
      <FloatingCart />
    </div>
  );
}

export default BrowseRestaurants;
