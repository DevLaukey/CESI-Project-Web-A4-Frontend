export default function ProfileInfo({ user, userType }) {
  const getInitials = (name) => {
    if (!name) {
      // Default initials based on user type
      switch (userType) {
        case "restaurant_owner":
          return "RO";
        case "delivery_driver":
          return "DD";
        case "end_user":
          return "EU";
        default:
          return "U";
      }
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name;

    // Fallback names based on user type
    switch (userType) {
      case "restaurant_owner":
        return "Restaurant Owner";
      case "delivery_driver":
        return "Delivery Driver";
      case "end_user":
        return "Customer";
      default:
        return "User";
    }
  };

  const getUserRole = () => {
    switch (userType) {
      case "restaurant_owner":
        return user?.restaurantName || "Restaurant Owner";
      case "delivery_driver":
        return user?.vehicleType
          ? `Driver (${user.vehicleType})`
          : "Delivery Driver";
      case "end_user":
        return user?.location || "Customer";
      default:
        return "User";
    }
  };

  const getAvatarColors = () => {
    switch (userType) {
      case "restaurant_owner":
        return "from-blue-500 to-purple-500";
      case "delivery_driver":
        return "from-green-500 to-teal-500";
      case "end_user":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-8 h-8 bg-gradient-to-r ${getAvatarColors()} rounded-full flex items-center justify-center`}
      >
        <span className="text-white text-sm font-medium">
          {getInitials(getDisplayName())}
        </span>
      </div>
      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
        <p className="text-xs text-gray-500">{getUserRole()}</p>
      </div>
    </div>
  );
}
