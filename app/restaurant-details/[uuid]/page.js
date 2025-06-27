"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Clock,
  Truck,
  MapPin,
  Phone,
  Mail,
  Heart,
  Share2,
  Plus,
  Minus,
  ShoppingCart,
  Info,
  Check,
  X,
  Search,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { customerAPI } from "@/libs/api";
import FloatingCart from "@/components/layout/FloatingCart";
import Image from "next/image";
import { useCart } from "@/data/CartContext";

function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantUuid = params.uuid;

  const { addToCart, restaurant: cartRestaurant } = useCart(); // Use cart context

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const menuCategories = [
    { name: "All", emoji: "🍽️" },
    { name: "Appetizers", emoji: "🥗" },
    { name: "Main Course", emoji: "🍖" },
    { name: "Pizza", emoji: "🍕" },
    { name: "Pasta", emoji: "🍝" },
    { name: "Desserts", emoji: "🧁" },
    { name: "Beverages", emoji: "🥤" },
    { name: "Appetizers & Starters", emoji: "🥗" },
  ];

  useEffect(() => {
    if (restaurantUuid) {
      fetchRestaurantDetails();
      fetchMenuItems();
      loadFavoriteStatus();
    }
  }, [restaurantUuid]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching restaurant details for:", restaurantUuid);

      const response = await customerAPI.getRestaurantById(restaurantUuid);
      console.log("Restaurant details:", response);

      let restaurantData = null;
      if (response.success && response.restaurant) {
        restaurantData = response.restaurant;
      } else if (response.uuid) {
        restaurantData = response;
      }


      if (!restaurantData || !restaurantData.uuid) {
        console.log("Invalid restaurant data");
        setRestaurant(null);
        return;
      }

      // Transform restaurant data to have items.price as a number
      if (restaurantData.items && Array.isArray(restaurantData.items)) {
        restaurantData.items = restaurantData.items.map((item) => ({
          ...item,
          basePrice: parseFloat(item.price) || 0,
          price: parseFloat(item.price) || 0,
          category: item.category?.name || "Uncategorized",
          image: item.images && item.images.length > 0 ? item.images[0] : null,
          restaurantUuid: restaurantData.uuid,
          restaurantName: restaurantData.name,
          restaurantDeliveryFee: restaurantData.deliveryFee || 2.99,
        }));
      }

      console.log("Transformed restaurant data2:", restaurantData);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setItemsLoading(true);
      console.log("Fetching menu items for:", restaurantUuid);

      try {
        const response = await customerAPI.getMenuItems(restaurantUuid);
        console.log("Menu items:", response);

        let itemsData = [];
        if (Array.isArray(response)) {
          itemsData = response;
        } else if (response.items && Array.isArray(response.items)) {
          itemsData = response.items;
        } else if (response.data && Array.isArray(response.data)) {
          itemsData = response.data;
        }

        const transformedItems = itemsData.map((item) => ({
          ...item,
          basePrice: parseFloat(item.price) || 0,
          price: parseFloat(item.price) || 0,
          category: item.category?.name || "Uncategorized",
          image: item.images && item.images.length > 0 ? item.images[0] : null,
          restaurantUuid: restaurantUuid,
          restaurantName: restaurant?.name,
          restaurantDeliveryFee: restaurant?.deliveryFee,
        }));

        setMenuItems(transformedItems);
      } catch (apiError) {
        console.log("API call for menu items failed:", apiError);
        if (restaurant && restaurant.items) {
          const transformedItems = restaurant.items.map((item) => ({
            ...item,
            basePrice: parseFloat(item.price) || 0,
            price: parseFloat(item.price) || 0,
            category: item.category?.name || "Uncategorized",
            image:
              item.images && item.images.length > 0 ? item.images[0] : null,
            restaurantUuid: restaurantUuid,
            restaurantName: restaurant?.name,
            restaurantDeliveryFee: restaurant?.deliveryFee,
          }));
          setMenuItems(transformedItems);
        } else {
          setSampleMenuItems();
        }
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setSampleMenuItems();
    } finally {
      setItemsLoading(false);
    }
  };

  const setSampleMenuItems = () => {
    const sampleItems = [
      {
        id: 1,
        uuid: "item-1",
        name: "Margherita Pizza",
        description: "Fresh tomato sauce, mozzarella cheese, basil leaves",
        price: 14.99,
        basePrice: 14.99,
        category: "Pizza",
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
        isAvailable: true,
        preparationTime: 15,
        allergens: ["Gluten", "Dairy"],
        isVegetarian: true,
        isVegan: false,
        spicyLevel: 0,
        restaurantUuid: restaurantUuid,
        restaurantName: restaurant?.name,
        restaurantDeliveryFee: restaurant?.deliveryFee,
      },
      {
        id: 2,
        uuid: "item-2",
        name: "Chicken Alfredo Pasta",
        description: "Creamy alfredo sauce with grilled chicken and parmesan",
        price: 18.5,
        basePrice: 18.5,
        category: "Pasta",
        image:
          "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
        isAvailable: true,
        preparationTime: 20,
        allergens: ["Gluten", "Dairy"],
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
        restaurantUuid: restaurantUuid,
        restaurantName: restaurant?.name,
        restaurantDeliveryFee: restaurant?.deliveryFee,
      },
    ];
    setMenuItems(sampleItems);
  };

  const loadFavoriteStatus = () => {
    try {
      const favorites = JSON.parse(
        localStorage.getItem("favoriteRestaurants") || "[]"
      );
      setIsFavorite(favorites.includes(restaurantUuid));
    } catch (error) {
      console.error("Error loading favorite status:", error);
    }
  };

  const toggleFavorite = () => {
    try {
      const favorites = JSON.parse(
        localStorage.getItem("favoriteRestaurants") || "[]"
      );
      let newFavorites;

      if (isFavorite) {
        newFavorites = favorites.filter((id) => id !== restaurantUuid);
      } else {
        newFavorites = [...favorites, restaurantUuid];
      }

      localStorage.setItem("favoriteRestaurants", JSON.stringify(newFavorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleAddToCart = async (item) => {
    // Prepare the item with restaurant information
    const cartItem = {
      ...item,
      basePrice: item.basePrice || item.price,
      restaurantUuid: restaurantUuid,
      restaurantName: restaurant?.name,
      restaurantDeliveryFee: restaurant?.deliveryFee || 2.99,
    };

    try {
      const success = await addToCart(cartItem, null, []); // No size or extras for now

      if (success) {
        // Optional: Show success message
        console.log(`Added ${item.name} to cart`);
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      item.category?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory && item.isAvailable;
  });

  // Helper functions
  const isRestaurantOpen = () => {
    if (!restaurant) return false;

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
    if (!todayHours || todayHours.isClosed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const shouldBeOpenByHours = () => {
    if (!restaurant || !restaurant.openingHours) return false;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const todayHours = restaurant.openingHours[currentDay];
    if (!todayHours || todayHours.isClosed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const getRestaurantImage = () => {
    if (!restaurant) return "";

    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop";
  };

  // Check if user has items from different restaurant in cart
  const hasDifferentRestaurantInCart = () => {
    return cartRestaurant && cartRestaurant.uuid !== restaurantUuid;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant not found
          </h2>
          <p className="text-gray-600 mb-4">
            The restaurant you're looking for doesn't exist or couldn't be
            loaded.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOpen = isRestaurantOpen();
  const shouldBeOpen = shouldBeOpenByHours();
  const showStatusWarning = !isOpen && shouldBeOpen && !dismissedWarning;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Different Restaurant Warning */}
      {hasDifferentRestaurantInCart() && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-800">
                Different Restaurant in Cart
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                You have items from {cartRestaurant.name} in your cart. Adding
                items from {restaurant.name} will clear your current cart.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Warning Cards */}
      {showStatusWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Restaurant Status Notice
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This restaurant appears to be closed according to our system,
                but based on their opening hours, it should be open right now.
                You can browse the menu, but ordering might be temporarily
                unavailable.
              </p>
            </div>
            <button
              onClick={() => setDismissedWarning(true)}
              className="ml-3 flex-shrink-0 text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isOpen && !showStatusWarning && !dismissedWarning && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Restaurant Currently Closed
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {restaurant.name} is currently closed. You can browse the menu
                but cannot place orders at this time.
              </p>
            </div>
            <button
              onClick={() => setDismissedWarning(true)}
              className="ml-3 flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Image */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <Image
          src={getRestaurantImage()}
          alt={restaurant.name}
          width={800}
          height={400}
          quality={100}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop";
          }}
        />

        <div className="absolute inset-0 bg-opacity-20"></div>

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            onClick={toggleFavorite}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </button>
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {restaurant.name}
                </h1>
                {restaurant.isVerified && (
                  <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    <Check className="w-3 h-3 inline mr-1" />
                    Verified
                  </div>
                )}
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {isOpen ? "Open" : "Closed"}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {parseFloat(restaurant.rating) > 0
                      ? parseFloat(restaurant.rating).toFixed(1)
                      : "4.5"}
                  </span>
                  <span>({restaurant.reviewCount || 100} reviews)</span>
                </div>
                <span>•</span>
                <span>{restaurant.cuisineType}</span>
              </div>

              {restaurant.description && (
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {restaurant.averageDeliveryTime || 30} min delivery
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="w-4 h-4" />
                  <span>
                    €{parseFloat(restaurant.deliveryFee || 2.99).toFixed(2)}{" "}
                    delivery fee
                  </span>
                </div>
                {restaurant.minimumOrder &&
                  parseFloat(restaurant.minimumOrder) > 0 && (
                    <div className="flex items-center space-x-1">
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        €{parseFloat(restaurant.minimumOrder).toFixed(2)}{" "}
                        minimum
                      </span>
                    </div>
                  )}
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {restaurant.address}, {restaurant.city}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{restaurant.phone}</span>
              </a>
            )}
            {restaurant.email && (
              <a
                href={`mailto:${restaurant.email}`}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">{restaurant.email}</span>
              </a>
            )}
          </div>

          {/* Tags */}
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {restaurant.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Menu
          </h2>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {menuCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all ${
                  selectedCategory === category.name
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-xl mb-1">{category.emoji}</span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => (
              <div
                key={item.uuid}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                    }
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                    }}
                  />

                  {/* Dietary Badges */}
                  <div className="absolute top-2 left-2 flex space-x-1">
                    {item.isVegetarian && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        🌱 Veg
                      </span>
                    )}
                    {item.isVegan && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        🌿 Vegan
                      </span>
                    )}
                    {item.spicyLevel > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {"🌶️".repeat(item.spicyLevel)}
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        🌶️ Spicy
                      </span>
                    )}
                  </div>

                  {/* Preparation Time */}
                  {item.preparationTime && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {item.preparationTime} min
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 flex-1 mr-2">
                      {item.name}
                    </h3>
                    <div className="text-right">
                      <span className="font-bold text-lg text-green-600">
                        €{(item.basePrice || item.price).toFixed(2)}
                      </span>
                      {item.originalPrice &&
                        parseFloat(item.originalPrice) >
                          parseFloat(item.price) && (
                          <div className="text-sm text-gray-400 line-through">
                            €{parseFloat(item.originalPrice).toFixed(2)}
                          </div>
                        )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs capitalize"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!isOpen}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isOpen
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title={
                      !isOpen ? "Restaurant is currently closed" : "Add to cart"
                    }
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No menu items found
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "This restaurant hasn't added any menu items yet"}
            </p>
          </div>
        )}
      </div>

      {/* FloatingCart Component - Pass restaurant data for better functionality */}
      <FloatingCart restaurant={restaurant} />
    </div>
  );
}

export default RestaurantDetailPage;
