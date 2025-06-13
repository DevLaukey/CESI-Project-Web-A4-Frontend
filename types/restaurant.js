export const createRestaurantData = (data = {}) => ({
  id: data.id || "",
  name: data.name || "",
  logo: data.logo || "",
  logoImage: data.logoImage || "",
  backgroundColor: data.backgroundColor || "#666666",
  category: data.category || "",
  isActive: data.isActive !== undefined ? data.isActive : true,
  displayOrder: data.displayOrder || 0,
  description: data.description || "",
  website: data.website || "",
  deliveryTime: data.deliveryTime || "30-45 mins",
  minimumOrder: data.minimumOrder || 0,
  deliveryFee: data.deliveryFee || 0,
  rating: data.rating || 0,
  reviewCount: data.reviewCount || 0,
  ...data,
});

export const getRestaurantDisplayData = (restaurant) => ({
  ...restaurant,
  formattedMinimumOrder:
    restaurant.minimumOrder > 0
      ? `$${restaurant.minimumOrder.toFixed(2)}`
      : "No minimum",
  formattedDeliveryFee:
    restaurant.deliveryFee === 0
      ? "Free delivery"
      : `$${restaurant.deliveryFee.toFixed(2)}`,
  displayRating:
    restaurant.rating > 0 ? `${restaurant.rating.toFixed(1)} ⭐` : "No rating",
});
