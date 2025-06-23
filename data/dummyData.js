export const dummyRestaurants = [
  {
    uuid: "rest-001",
    name: "La Bella Italia",
    description:
      "Authentic Italian cuisine with fresh ingredients and traditional recipes",
    cuisineType: "Italian",
    rating: 4.7,
    reviewCount: 248,
    city: "Paris",
    address: "123 Rue de la Paix",
    phone: "+33 1 42 96 50 50",
    email: "contact@labellaitallia.fr",
    deliveryFee: 3.5,
    minimumOrder: 15.0,
    averageDeliveryTime: 25,
    bannerImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    isVerified: true,
    isOpenNow: true,
    tags: ["Italian", "Pizza", "Pasta", "Authentic"],
    openingHours: {
      0: { open: 1200, close: 2200, isClosed: false }, // Sunday
      1: { open: 1200, close: 2200, isClosed: false }, // Monday
      2: { open: 1200, close: 2200, isClosed: false }, // Tuesday
      3: { open: 1200, close: 2200, isClosed: false }, // Wednesday
      4: { open: 1200, close: 2200, isClosed: false }, // Thursday
      5: { open: 1200, close: 2300, isClosed: false }, // Friday
      6: { open: 1200, close: 2300, isClosed: false }, // Saturday
    },
  },
  {
    uuid: "rest-002",
    name: "Le Petit Bistro",
    description:
      "Classic French bistro serving traditional dishes with a modern twist",
    cuisineType: "French",
    rating: 4.5,
    reviewCount: 189,
    city: "Paris",
    address: "45 Boulevard Saint-Germain",
    phone: "+33 1 43 26 48 23",
    email: "info@lepetitbistro.fr",
    deliveryFee: 4.0,
    minimumOrder: 20.0,
    averageDeliveryTime: 30,
    bannerImage:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
    isVerified: true,
    isOpenNow: true,
    tags: ["French", "Bistro", "Wine", "Traditional"],
    openingHours: {
      0: { open: 1800, close: 2200, isClosed: false },
      1: { open: 1200, close: 1400, isClosed: false },
      2: { open: 1200, close: 2200, isClosed: false },
      3: { open: 1200, close: 2200, isClosed: false },
      4: { open: 1200, close: 2200, isClosed: false },
      5: { open: 1200, close: 2300, isClosed: false },
      6: { open: 1200, close: 2300, isClosed: false },
    },
  },
  {
    uuid: "rest-003",
    name: "Sakura Sushi",
    description: "Fresh sushi and Japanese cuisine made by expert chefs",
    cuisineType: "Japanese",
    rating: 4.8,
    reviewCount: 312,
    city: "Paris",
    address: "78 Rue du Faubourg Saint-Antoine",
    phone: "+33 1 48 05 30 58",
    email: "orders@sakurasushi.fr",
    deliveryFee: 2.5,
    minimumOrder: 18.0,
    averageDeliveryTime: 20,
    bannerImage:
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop",
    isVerified: true,
    isOpenNow: false,
    tags: ["Japanese", "Sushi", "Fresh", "Healthy"],
    openingHours: {
      0: { open: 1800, close: 2200, isClosed: false },
      1: { isClosed: true },
      2: { open: 1200, close: 2200, isClosed: false },
      3: { open: 1200, close: 2200, isClosed: false },
      4: { open: 1200, close: 2200, isClosed: false },
      5: { open: 1200, close: 2300, isClosed: false },
      6: { open: 1200, close: 2300, isClosed: false },
    },
  },
  {
    uuid: "rest-004",
    name: "Spice Garden",
    description:
      "Authentic Indian spices and flavors in traditional and modern dishes",
    cuisineType: "Indian",
    rating: 4.6,
    reviewCount: 156,
    city: "Paris",
    address: "92 Rue de Belleville",
    phone: "+33 1 42 08 66 22",
    email: "hello@spicegarden.fr",
    deliveryFee: 3.0,
    minimumOrder: 16.0,
    averageDeliveryTime: 35,
    bannerImage:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    isVerified: false,
    isOpenNow: true,
    tags: ["Indian", "Spicy", "Vegetarian", "Halal"],
    openingHours: {
      0: { open: 1700, close: 2200, isClosed: false },
      1: { open: 1700, close: 2200, isClosed: false },
      2: { open: 1700, close: 2200, isClosed: false },
      3: { open: 1700, close: 2200, isClosed: false },
      4: { open: 1700, close: 2200, isClosed: false },
      5: { open: 1200, close: 2300, isClosed: false },
      6: { open: 1200, close: 2300, isClosed: false },
    },
  },
  {
    uuid: "rest-005",
    name: "Burger Palace",
    description:
      "Gourmet burgers made with premium ingredients and artisanal buns",
    cuisineType: "American",
    rating: 4.3,
    reviewCount: 203,
    city: "Paris",
    address: "15 Avenue des Champs-Élysées",
    phone: "+33 1 53 96 30 30",
    email: "info@burgerpalace.fr",
    deliveryFee: 2.99,
    minimumOrder: 12.0,
    averageDeliveryTime: 15,
    bannerImage:
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&h=400&fit=crop",
    profileImage:
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop",
    isVerified: true,
    isOpenNow: true,
    tags: ["American", "Burgers", "Fast Food", "Casual"],
    openingHours: {
      0: { open: 1100, close: 2300, isClosed: false },
      1: { open: 1100, close: 2300, isClosed: false },
      2: { open: 1100, close: 2300, isClosed: false },
      3: { open: 1100, close: 2300, isClosed: false },
      4: { open: 1100, close: 2300, isClosed: false },
      5: { open: 1100, close: 2400, isClosed: false },
      6: { open: 1100, close: 2400, isClosed: false },
    },
  },
];

export const dummyMenuItems = {
  "rest-001": [
    // La Bella Italia
    {
      uuid: "item-001-001",
      name: "Margherita Pizza",
      description:
        "Fresh tomato sauce, mozzarella di bufala, basil leaves, extra virgin olive oil",
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
      sizes: [
        { name: 'Small (8")', price: 0 },
        { name: 'Medium (10")', price: 3.0 },
        { name: 'Large (12")', price: 6.0 },
      ],
      extras: [
        { name: "Extra Cheese", price: 2.5 },
        { name: "Mushrooms", price: 1.5 },
        { name: "Olives", price: 1.0 },
        { name: "Pepperoni", price: 3.0 },
      ],
    },
    {
      uuid: "item-001-002",
      name: "Spaghetti Carbonara",
      description:
        "Traditional Roman pasta with eggs, pecorino cheese, pancetta, and black pepper",
      basePrice: 16.5,
      category: "Pasta",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 20,
      allergens: ["Gluten", "Dairy", "Eggs"],
      isVegetarian: false,
      isVegan: false,
      spicyLevel: 0,
      sizes: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 4.0 },
      ],
      extras: [
        { name: "Extra Pancetta", price: 3.0 },
        { name: "Truffle Oil", price: 4.5 },
        { name: "Parmesan", price: 2.0 },
      ],
    },
    {
      uuid: "item-001-003",
      name: "Tiramisu",
      description:
        "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
      basePrice: 7.99,
      category: "Desserts",
      image:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 5,
      allergens: ["Dairy", "Eggs", "Gluten"],
      isVegetarian: true,
      isVegan: false,
      spicyLevel: 0,
      sizes: [],
      extras: [],
    },
  ],
  "rest-002": [
    // Le Petit Bistro
    {
      uuid: "item-002-001",
      name: "Coq au Vin",
      description:
        "Traditional French chicken braised in red wine with mushrooms and herbs",
      basePrice: 22.5,
      category: "Main Course",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 35,
      allergens: ["Sulfites"],
      isVegetarian: false,
      isVegan: false,
      spicyLevel: 0,
      sizes: [],
      extras: [
        { name: "Extra Sauce", price: 2.0 },
        { name: "Side Salad", price: 4.5 },
        { name: "French Bread", price: 3.0 },
      ],
    },
    {
      uuid: "item-002-002",
      name: "French Onion Soup",
      description:
        "Rich beef broth with caramelized onions, topped with gruyere cheese",
      basePrice: 9.5,
      category: "Appetizers",
      image:
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 15,
      allergens: ["Dairy", "Gluten"],
      isVegetarian: false,
      isVegan: false,
      spicyLevel: 0,
      sizes: [],
      extras: [
        { name: "Extra Cheese", price: 2.0 },
        { name: "Crusty Bread", price: 1.5 },
      ],
    },
  ],
  "rest-003": [
    // Sakura Sushi
    {
      uuid: "item-003-001",
      name: "Salmon Sashimi",
      description:
        "Fresh Atlantic salmon, expertly sliced, served with wasabi and pickled ginger",
      basePrice: 18.0,
      category: "Sashimi",
      image:
        "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 10,
      allergens: ["Fish"],
      isVegetarian: false,
      isVegan: false,
      spicyLevel: 0,
      sizes: [
        { name: "6 pieces", price: 0 },
        { name: "12 pieces", price: 12.0 },
      ],
      extras: [
        { name: "Extra Wasabi", price: 1.0 },
        { name: "Extra Ginger", price: 1.0 },
        { name: "Soy Sauce", price: 0.5 },
      ],
    },
    {
      uuid: "item-003-002",
      name: "Dragon Roll",
      description:
        "Shrimp tempura, cucumber, topped with eel and avocado, drizzled with eel sauce",
      basePrice: 15.5,
      category: "Sushi Rolls",
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 15,
      allergens: ["Fish", "Shellfish", "Gluten"],
      isVegetarian: false,
      isVegan: false,
      spicyLevel: 0,
      sizes: [],
      extras: [
        { name: "Extra Eel Sauce", price: 1.5 },
        { name: "Spicy Mayo", price: 1.0 },
        { name: "Sesame Seeds", price: 0.5 },
      ],
    },
  ],
  "rest-004": [
    // Spice Garden
    {
      uuid: "item-004-001",
      name: "Chicken Tikka Masala",
      description:
        "Tender chicken in a rich, creamy tomato-based curry sauce with aromatic spices",
      basePrice: 17.99,
      category: "Main Course",
      image:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 25,
      allergens: ["Dairy"],
      isVegetarian: false,
      isVegan: false,
      spicyLevel: 2,
      sizes: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 5.0 },
      ],
      extras: [
        { name: "Basmati Rice", price: 3.5 },
        { name: "Naan Bread", price: 4.0 },
        { name: "Extra Spicy", price: 0 },
        { name: "Mild", price: 0 },
      ],
    },
    {
      uuid: "item-004-002",
      name: "Vegetable Samosas",
      description:
        "Crispy pastry filled with spiced potatoes, peas, and aromatic herbs",
      basePrice: 8.99,
      category: "Appetizers",
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 12,
      allergens: ["Gluten"],
      isVegetarian: true,
      isVegan: true,
      spicyLevel: 1,
      sizes: [
        { name: "2 pieces", price: 0 },
        { name: "4 pieces", price: 6.0 },
      ],
      extras: [
        { name: "Mint Chutney", price: 1.5 },
        { name: "Tamarind Sauce", price: 1.5 },
        { name: "Mixed Chutney", price: 2.5 },
      ],
    },
  ],
  "rest-005": [
    // Burger Palace
    {
      uuid: "item-005-001",
      name: "Classic Cheeseburger",
      description:
        "Juicy beef patty with cheddar cheese, lettuce, tomato, pickles, and special sauce",
      basePrice: 13.99,
      category: "Burgers",
      image:
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 12,
      allergens: ["Dairy", "Gluten", "Eggs"],
      isVegetarian: false,
      isVegan: false,
      spicyLevel: 0,
      sizes: [
        { name: "Regular", price: 0 },
        { name: "Double Patty", price: 5.0 },
      ],
      extras: [
        { name: "Bacon", price: 3.0 },
        { name: "Extra Cheese", price: 2.0 },
        { name: "Avocado", price: 2.5 },
        { name: "French Fries", price: 4.5 },
        { name: "Onion Rings", price: 5.0 },
      ],
    },
    {
      uuid: "item-005-002",
      name: "Truffle Fries",
      description:
        "Crispy golden fries tossed with truffle oil, parmesan cheese, and fresh herbs",
      basePrice: 9.99,
      category: "Sides",
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
      isAvailable: true,
      preparationTime: 8,
      allergens: ["Dairy"],
      isVegetarian: true,
      isVegan: false,
      spicyLevel: 0,
      sizes: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 3.0 },
      ],
      extras: [
        { name: "Extra Truffle Oil", price: 2.5 },
        { name: "Extra Parmesan", price: 2.0 },
        { name: "Garlic Aioli", price: 1.5 },
      ],
    },
  ],
};
