"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { customerAPI } from "@/libs/api";

function BrowseRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [userLocation, setUserLocation] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState({
    minRating: null,
    radius: 10, // Default 10km radius
  });

  // Food categories with emojis
  const categories = [
    { name: "All", emoji: "🍽️", value: null },
    { name: "Grocery", emoji: "🍌", value: "grocery" },
    { name: "Halal", emoji: "🥘", value: "halal" },
    { name: "Pizza", emoji: "🍕", value: "pizza" },
    { name: "Sushi", emoji: "🍣", value: "sushi" },
    { name: "Fast Food", emoji: "🍟", value: "fast_food" },
    { name: "Desserts", emoji: "🧁", value: "desserts" },
    { name: "Burgers", emoji: "🍔", value: "burgers" },
    { name: "Asian", emoji: "🍜", value: "asian" },
    { name: "Healthy", emoji: "🥗", value: "healthy" },
    { name: "Bubble Tea", emoji: "🧋", value: "bubble_tea" },
    { name: "Indian", emoji: "🍛", value: "indian" },
    { name: "Korean", emoji: "🥟", value: "korean" },
  ];

  useEffect(() => {
    fetchRestaurants();
    loadUserLocation();
  }, []);

  // Fetch restaurants when search query, category, or filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchRestaurants(true); // Reset to first page when filters change
    }, 500); // 500ms debounce for search

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, filters.minRating]);

  const loadUserLocation = () => {
    try {
      const storedLocation = localStorage.getItem("userLocation");
      if (storedLocation) {
        const locationData = JSON.parse(storedLocation);
        setUserLocation(locationData);
      }
    } catch (error) {
      console.error("Error loading user location:", error);
    }
  };

  const fetchRestaurants = async (resetPagination = false) => {
    try {
      setLoading(true);

      // Build search parameters
      const searchParams = new URLSearchParams();

      // Add search query if exists
      if (searchQuery && searchQuery.trim()) {
        searchParams.append("q", searchQuery.trim());
      }

      // Add pagination
      const currentPage = resetPagination ? 1 : pagination.page;
      searchParams.append("page", currentPage.toString());
      searchParams.append("limit", pagination.limit.toString());

      // Add cuisine filter
      const selectedCategoryData = categories.find(
        (cat) => cat.name === selectedCategory
      );
      if (selectedCategoryData && selectedCategoryData.value) {
        searchParams.append("cuisine", selectedCategoryData.value);
      }

      // Add rating filter
      if (filters.minRating) {
        searchParams.append("rating", filters.minRating.toString());
      }

      // Add location parameters if available
      if (userLocation && userLocation.coordinates) {
        searchParams.append(
          "latitude",
          userLocation.coordinates.lat.toString()
        );
        searchParams.append(
          "longitude",
          userLocation.coordinates.lng.toString()
        );
        searchParams.append("radius", filters.radius.toString());
      }

      console.log("Search params:", searchParams.toString());

      // Make API call
      const response = await customerAPI.getRestaurants();

      console.log("API Response:", response);

      if (resetPagination) {
        setRestaurants(response.restaurants || []);
        setPagination({
          page: 1,
          limit: pagination.limit,
          total: response.total || 0,
          hasMore: response.hasMore || false,
        });
      } else {
        // Append to existing restaurants for pagination
        setRestaurants((prev) => [...prev, ...(response.restaurants || [])]);
        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          total: response.total || prev.total,
          hasMore: response.hasMore || false,
        }));
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      // Handle error - maybe show a toast notification
      if (resetPagination) {
        setRestaurants([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRestaurants = () => {
    if (!loading && pagination.hasMore) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
      fetchRestaurants(false);
    }
  };

  const toggleFavorite = (restaurantId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(restaurantId)) {
        newFavorites.delete(restaurantId);
      } else {
        newFavorites.add(restaurantId);
      }
      return newFavorites;
    });
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRatingFilter = (minRating) => {
    setFilters((prev) => ({ ...prev, minRating }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setFilters({ minRating: null, radius: 10 });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRestaurantClick = (restaurantId) => {
    console.log("Navigate to restaurant:", restaurantId);
    // For Next.js: router.push(`/restaurant/${restaurantId}`);
  };

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>

            {/* Categories skeleton */}
            <div className="flex space-x-4 mb-6 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg"
                ></div>
              ))}
            </div>

            {/* Restaurant cards skeleton */}
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
                  {userLocation
                    ? userLocation.formattedAddress?.split(",")[0] ||
                      "Current location"
                    : "3 Av. Albert Einstein"}{" "}
                  • Now
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative">
                <button className="bg-black text-white px-3 sm:px-4 py-2 rounded-full text-sm font-medium">
                  🛒 <span className="hidden sm:inline">0</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search restaurants..."
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
            <span className="text-sm font-medium">Dietary</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border hover:bg-gray-50 whitespace-nowrap">
            <span className="text-sm font-medium">Sort</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {searchQuery
              ? `Results for "${searchQuery}" (${pagination.total} found)`
              : `Restaurants near you (${pagination.total} found)`}
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
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => handleRestaurantClick(restaurant.id)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={
                    restaurant.image ||
                    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop"
                  }
                  alt={restaurant.name}
                  className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop";
                  }}
                />

                {/* Offer Badge */}
                {restaurant.offer && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium max-w-[120px] truncate">
                    {restaurant.offer}
                  </div>
                )}

                {/* Exclusive Badge */}
                {restaurant.isExclusive && (
                  <div className="absolute top-3 left-3 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Exclusive
                  </div>
                )}

                {/* Promoted Badge */}
                {restaurant.isPromoted && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Promoted
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(restaurant.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(restaurant.id)
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
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-green-500 text-green-500" />
                    <span className="font-medium text-xs sm:text-sm">
                      {restaurant.rating || 4.5}
                    </span>
                    <span className="text-gray-500 text-xs hidden sm:inline">
                      ({restaurant.reviewCount || 100})
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3">
                  {restaurant.cuisine || "Restaurant"}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">
                        {restaurant.deliveryTime || "20-30"} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">
                        €{restaurant.deliveryFee || "2.99"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {restaurant.distance || "1.2 km"}
                  </span>
                </div>

                {/* Tags */}
                {restaurant.tags && restaurant.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {restaurant.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreRestaurants}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "Load More Restaurants"
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {restaurants.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseRestaurants;
