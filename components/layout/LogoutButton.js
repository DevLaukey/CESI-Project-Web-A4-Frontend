"use client";
import { useAuth } from "@/components/AuthContext";
import { authAPI } from "@/utils/api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LogoutButton({ className = "", children }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API to invalidate token on server
      await authAPI.logout();
    } catch (error) {
      // Even if API call fails, continue with local logout
      console.error("Logout API error:", error);
    } finally {
      // Clear all auth-related cookies
      Cookies.remove("authToken");
      Cookies.remove("userData");
      Cookies.remove("userLocation"); // Optional: also clear location

      // Clear auth context
      logout();

      // Redirect to home page
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "bg-white hover:bg-yellow-50 rounded-full border border-yellow-400 text-yellow-600 hover:text-yellow-700 px-4 sm:px-6 py-2 text-sm font-medium transition-colors"
      }
    >
      {children || "Logout"}
    </button>
  );
}
