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
  Filter,
  Search,
} from "lucide-react";
import { customerAPI } from "@/libs/api";

function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantUuid = params.uuid;

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);

  const menuCategories = [
    { name: "All", emoji: "🍽️" },
    { name: "Appetizers", emoji: "🥗" },
    { name: "Main Course", emoji: "🍖" },
    { name: "Pizza", emoji: "🍕" },
    { name: "Pasta", emoji: "🍝" },
    { name: "Desserts", emoji: "🧁" },
    { name: "Beverages", emoji: "🥤" },
  ];

  useEffect(() => {
    if (restaurantUuid) {
      fetchRestaurantDetails();
      fetchMenuItems();
      loadFavoriteStatus();
      loadCart();
    }
  }, [restaurantUuid]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching restaurant details for:", restaurantUuid);

      // Assuming you have an API endpoint to get restaurant by UUID
      const response = await customerAPI.getRestaurantById(restaurantUuid);
      console.log("Restaurant details:", response);

      setRestaurant(response);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      // You might want to show an error page or redirect
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setItemsLoading(true);
      console.log("Fetching menu items for:", restaurantUuid);

      // Assuming you have an API endpoint to get menu items by restaurant UUID
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

      setMenuItems(itemsData);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      // For demo purposes, let's add some sample items
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
        category: "Pizza",
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
        isAvailable: true,
        preparationTime: 15,
        allergens: ["Gluten", "Dairy"],
        isVegetarian: true,
        isVegan: false,
        spicyLevel: 0,
      },
      {
        id: 2,
        uuid: "item-2",
        name: "Chicken Alfredo Pasta",
        description: "Creamy alfredo sauce with grilled chicken and parmesan",
        price: 18.5,
        category: "Pasta",
        image:
          "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
        isAvailable: true,
        preparationTime: 20,
        allergens: ["Gluten", "Dairy"],
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
      },
      {
        id: 3,
        uuid: "item-3",
        name: "Caesar Salad",
        description:
          "Crisp romaine lettuce, croutons, parmesan, caesar dressing",
        price: 12.99,
        category: "Appetizers",
        image:
          "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop",
        isAvailable: true,
        preparationTime: 10,
        allergens: ["Dairy", "Eggs"],
        isVegetarian: true,
        isVegan: false,
        spicyLevel: 0,
      },
      {
        id: 4,
        uuid: "item-4",
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 8.99,
        category: "Desserts",
        image:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
        isAvailable: true,
        preparationTime: 5,
        allergens: ["Dairy", "Eggs", "Gluten"],
        isVegetarian: true,
        isVegan: false,
        spicyLevel: 0,
      },
    ];
    setMenuItems(sampleItems);
  };

  const loadFavoriteStatus = () => {
    try {
      const favorites = JSON.parse(
        sessionStorage.getItem("favoriteRestaurants") || "[]"
      );
      setIsFavorite(favorites.includes(restaurantUuid));
    } catch (error) {
      console.error("Error loading favorite status:", error);
    }
  };

  const loadCart = () => {
    try {
      const savedCart = JSON.parse(
        sessionStorage.getItem(`cart_${restaurantUuid}`) || "[]"
      );
      setCart(savedCart);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const saveCart = (newCart) => {
    try {
      sessionStorage.setItem(`cart_${restaurantUuid}`, JSON.stringify(newCart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const toggleFavorite = () => {
    try {
      const favorites = JSON.parse(
        sessionStorage.getItem("favoriteRestaurants") || "[]"
      );
      let newFavorites;

      if (isFavorite) {
        newFavorites = favorites.filter((id) => id !== restaurantUuid);
      } else {
        newFavorites = [...favorites, restaurantUuid];
      }

      sessionStorage.setItem(
        "favoriteRestaurants",
        JSON.stringify(newFavorites)
      );
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.uuid === item.uuid);
    let newCart;

    if (existingItem) {
      newCart = cart.map((cartItem) =>
        cartItem.uuid === item.uuid
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      newCart = [...cart, { ...item, quantity: 1 }];
    }

    setCart(newCart);
    saveCart(newCart);
  };

  const removeFromCart = (itemUuid) => {
    const existingItem = cart.find((cartItem) => cartItem.uuid === itemUuid);
    let newCart;

    if (existingItem && existingItem.quantity > 1) {
      newCart = cart.map((cartItem) =>
        cartItem.uuid === itemUuid
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
    } else {
      newCart = cart.filter((cartItem) => cartItem.uuid !== itemUuid);
    }

    setCart(newCart);
    saveCart(newCart);
  };

  const getCartQuantity = (itemUuid) => {
    const item = cart.find((cartItem) => cartItem.uuid === itemUuid);
    return item ? item.quantity : 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
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
    if (restaurant.isOpenNow !== undefined) return restaurant.isOpenNow;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const todayHours = restaurant.openingHours?.[currentDay];
    if (!todayHours || todayHours.isClosed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const getRestaurantImage = () => {
    if (!restaurant) return "";
    return (
      restaurant.bannerImage ||
      restaurant.profileImage ||
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop"
    );
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
            The restaurant you're looking for doesn't exist.
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <img
          src={getRestaurantImage()}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop";
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Action Buttons */}
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
                    €{parseFloat(restaurant.deliveryFee).toFixed(2)} delivery
                    fee
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
        {/* Search and Categories */}
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
            {filteredMenuItems.map((item) => {
              const quantity = getCartQuantity(item.uuid);

              return (
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
                      <span className="font-bold text-lg text-green-600">
                        €{item.price.toFixed(2)}
                      </span>
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
                            className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart Controls */}
                    <div className="flex items-center justify-between">
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          disabled={!isOpen}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            isOpen
                              ? "bg-black text-white hover:bg-gray-800"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => removeFromCart(item.uuid)}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium text-lg min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="bg-black text-white px-6 py-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center space-x-3"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">
              {getTotalItems()} items • €{getCartTotal().toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Cart Modal/Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Your Order</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              {cart.map((item) => (
                <div
                  key={item.uuid}
                  className="flex items-center space-x-3 py-3 border-b"
                >
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                    }
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-gray-600 text-xs">
                      €{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.uuid)}
                      className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-medium text-sm min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1 bg-black text-white hover:bg-gray-800 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery fee</span>
                  <span>€{parseFloat(restaurant.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>
                    €
                    {(
                      getCartTotal() + parseFloat(restaurant.deliveryFee)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Handle checkout logic here
                  console.log("Proceeding to checkout with cart:", cart);
                  // You can redirect to checkout page or open checkout modal
                  // router.push('/checkout');
                }}
                disabled={
                  getCartTotal() < parseFloat(restaurant.minimumOrder || 0)
                }
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                  getCartTotal() >= parseFloat(restaurant.minimumOrder || 0)
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {getCartTotal() < parseFloat(restaurant.minimumOrder || 0)
                  ? `Minimum order €${parseFloat(
                      restaurant.minimumOrder
                    ).toFixed(2)}`
                  : "Proceed to Checkout"}
              </button>

              {restaurant.minimumOrder &&
                getCartTotal() < parseFloat(restaurant.minimumOrder) && (
                  <p className="text-sm text-red-600 mt-2 text-center">
                    Add €
                    {(
                      parseFloat(restaurant.minimumOrder) - getCartTotal()
                    ).toFixed(2)}{" "}
                    more to reach minimum order
                  </p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Restaurant closed overlay */}
      {!isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
            <div className="text-4xl mb-4">🕐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Restaurant Closed
            </h3>
            <p className="text-gray-600 mb-4">
              {restaurant.name} is currently closed. You can browse the menu but
              cannot place orders at this time.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantDetailPage;
