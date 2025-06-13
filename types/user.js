export const USER_TYPES = {
  END_USER: "end_user",
  RESTAURANT_OWNER: "restaurant_owner",
  DELIVERY_DRIVER: "delivery_driver",
};

export const createUserData = (data = {}) => ({
  email: data.email || "",
  password: data.password || "",
  userType: data.userType || USER_TYPES.END_USER,
  firstName: data.firstName || "",
  lastName: data.lastName || "",
  phone: data.phone || "",
  address: data.address || "",
  city: data.city || "",
  postalCode: data.postalCode || "",
  ...data,
});

export const validateUserData = (userData) => {
  const errors = {};

  // Required fields
  if (!userData.email) errors.email = "Email is required";
  if (!userData.password) errors.password = "Password is required";
  if (!userData.firstName) errors.firstName = "First name is required";
  if (!userData.lastName) errors.lastName = "Last name is required";
  if (!userData.phone) errors.phone = "Phone is required";

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (userData.email && !emailRegex.test(userData.email)) {
    errors.email = "Invalid email format";
  }

  // Password validation
  if (userData.password && userData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Phone validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (
    userData.phone &&
    !phoneRegex.test(userData.phone.replace(/[\s\-\(\)]/g, ""))
  ) {
    errors.phone = "Invalid phone number format";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
