import { AlertCircle, CheckCircle, Circle, LogOut, Package, RotateCcw , Plus, ClipboardList} from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileInfo from "./ProfileInfo";
import Link from "next/link";

export function AuthLinks({ isAuthenticated, user, userType, onLogout }) {
  const router = useRouter();

  console.log("AuthLinks Props:", { isAuthenticated, user, userType });

  const getStatusIndicator = () => {
    switch (userType) {
      case "restaurant_owner":
        return user?.restaurantStatus === "online" ? (
          <span className="text-green-600 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Restaurant Online
          </span>
        ) : (
          <span className="text-red-600 text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Restaurant Offline
          </span>
        );
      case "delivery_driver":
        return user?.driverStatus === "available" ? (
          <span className="text-green-600 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Available
          </span>
        ) : (
          <span className="text-orange-600 text-xs flex items-center gap-1">
            <Circle className="w-3 h-3" />
            Busy
          </span>
        );
      case "end_user":
        return user?.membershipLevel ? (
          <span className="text-purple-600 text-xs flex items-center gap-1">
            <Circle className="w-3 h-3 fill-purple-500" />
            {user.membershipLevel} Member
          </span>
        ) : null;
      default:
        return null;
    }
  };

  console.log("User Type:", isAuthenticated, userType, user);

  if (isAuthenticated) {
    const statusIndicator = getStatusIndicator();
    return (
      <>
        <div className="relative group">
          <div className="cursor-pointer">
            <ProfileInfo user={user} userType={userType} />
          </div>

          {/* Enhanced Profile Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center space-x-3 mb-2">
                <ProfileInfo user={user} userType={userType} />
              </div>
              {statusIndicator && <div className="mt-2">{statusIndicator}</div>}
              <p className="text-xs text-gray-600 mt-1">
                {user?.email || "No email provided"}
              </p>
            </div>

            {/* Quick Actions for Restaurant Owners */}
            {userType === "restaurant_owner" && (
              <div className="border-t border-gray-200 py-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Actions
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => router.push("/restaurant/items")}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Menu Item
                    </button>
                    <button
                      onClick={() => router.push("/restaurant/orders")}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <ClipboardList className="w-3 h-3" />
                      View New Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for Delivery Drivers */}
            {userType === "delivery_driver" && (
              <div className="border-t border-gray-200 py-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Actions
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        /* Toggle availability */
                      }}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Toggle Availability
                    </button>
                    <button
                      onClick={() => router.push("/delivery/deliveries")}
                      className="w-full flex items-center gap-2 text-left text-sm text-gray-600 hover:text-gray-900 py-1"
                    >
                      <Package className="w-3 h-3" />
                      View Active Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <div className="border-t border-gray-200 py-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Link
          href={"/login"}
          className="text-gray-500 hover:text-gray-700 transition-colors text-sm sm:text-base"
        >
          <p className="text-gray-500 hover:text-gray-700 transition-colors text-sm sm:text-base">
            Login
          </p>
        </Link>
        <Link
          href={"/register?type=end_user"}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full px-4 sm:px-6 py-2 text-sm font-medium transition-colors inline-block shadow-sm"
        >
          <p className="text-white">Register</p>
        </Link>
      </>
    );
  }
}
