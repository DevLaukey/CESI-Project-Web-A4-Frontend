import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Camera,
  ChevronRight,
  MapPin,
  Trash2,
  Plus,
  Edit3,
  Save,
  Eye,
  EyeOff,
  CircleUser,
  CreditCard,
  Shield,
  FileText,
  Phone,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { authAPI } from "@/libs/api";
import toast from "react-hot-toast";
import Image from "next/image";

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userData, setUserData] = useState({
    uuid: "",
    email: "",
    userType: "",
    firstName: "",
    lastName: "",
    phone: "",
    isActive: true,
    isVerified: false,
    createdAt: "",
    countryCode: "",
    phoneNumber: "",
    country: "",
    state: "",
    lga: "",
    address: "",
    profilePhoto: "", // Don't set default here
    defaultDeliveryLocation: 0,
    deliveryLocations: [],
  });

  const [editData, setEditData] = useState({ ...userData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const menuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: CircleUser,
    },
    {
      id: "account",
      label: "Account & Payment",
      icon: CreditCard,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
    },
    {
      id: "legal",
      label: "Legal Agreements",
      icon: FileText,
    },
    {
      id: "contact",
      label: "Contact Us",
      icon: Phone,
    },
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await authAPI.getProfile();

      if (response.success && response.user) {
        const apiUser = response.user;

        let countryCode = "";
        let phoneNumber = "";
        if (apiUser.phone) {
          const phoneMatch = apiUser.phone.match(/^(\+\d{1,4})\s*(.+)$/);
          if (phoneMatch) {
            countryCode = phoneMatch[1];
            phoneNumber = phoneMatch[2];
          } else if (apiUser.phone.startsWith("+")) {
            const codeMatch = apiUser.phone.match(/^(\+\d{1,4})(\d+)$/);
            if (codeMatch) {
              countryCode = codeMatch[1];
              phoneNumber = codeMatch[2];
            } else {
              phoneNumber = apiUser.phone;
            }
          } else {
            phoneNumber = apiUser.phone;
          }
        }

        const profileData = {
          ...userData,
          uuid: apiUser.uuid,
          email: apiUser.email,
          userType: apiUser.userType,
          firstName: apiUser.firstName || "",
          lastName: apiUser.lastName || "",
          phone: apiUser.phone || "",
          isActive: apiUser.isActive,
          isVerified: apiUser.isVerified,
          createdAt: apiUser.createdAt,
          countryCode: countryCode,
          phoneNumber: phoneNumber,
          profilePhoto: apiUser.profilePhoto || "", // Don't set default here
        };

        setUserData(profileData);
        setEditData(profileData);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      toast.error("Failed to load profile. Please try again.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Prepare data for API call
      const updateData = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.countryCode
          ? `${editData.countryCode}${editData.phoneNumber}`
          : editData.phoneNumber,
      };

      // Call your updateProfile API
      const response = await authAPI.updateProfile(updateData);

      if (response.success) {
        if (response.user) {
          const updatedUserData = {
            ...userData,
            ...response.user,
            countryCode: editData.countryCode,
            phoneNumber: editData.phoneNumber,
          };
          setUserData(updatedUserData);
        } else {
          setUserData({ ...editData });
        }

        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
  };


  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordModal(false);
        toast.success("Password changed successfully!");
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(
        error.message || "Failed to change password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="flex-1 p-8">
      <div className="max-w-2xl">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Image
              src="/account.png" 
              width={96}
                height={96}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
            {/* {isEditing && (
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <Camera size={16} />
              </button>
            )} */}
          </div>

          {/* User Status Indicators */}
          <div className="flex space-x-2 mb-4">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                userData.isVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {userData.isVerified ? "Verified" : "Unverified"}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                userData.isActive
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {userData.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={editData?.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              disabled={!isEditing}
              className="w-full p-3 bg-gray-100 rounded-lg border-0 disabled:bg-gray-100 enabled:bg-white enabled:border enabled:border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={editData?.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              disabled={!isEditing}
              className="w-full p-3 bg-gray-100 rounded-lg border-0 disabled:bg-gray-100 enabled:bg-white enabled:border enabled:border-gray-300"
            />
          </div>
        </div>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={userData?.email || ""}
            disabled
            className="w-full p-3 bg-gray-100 rounded-lg border-0 text-gray-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Email cannot be changed for security reasons
          </p>
        </div>

        {/* Phone Number */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex">
            <input
              type="text"
              value={editData?.countryCode || ""}
              onChange={(e) => handleInputChange("countryCode", e.target.value)}
              disabled={!isEditing}
              placeholder="+234"
              className="w-20 p-3 bg-gray-100 rounded-l-lg border-0 disabled:bg-gray-100 enabled:bg-white enabled:border enabled:border-gray-300"
            />
            <input
              type="text"
              value={editData?.phoneNumber || ""}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              disabled={!isEditing}
              placeholder="Phone number"
              className="flex-1 p-3 bg-gray-100 rounded-r-lg border-0 disabled:bg-gray-100 enabled:bg-white enabled:border enabled:border-gray-300"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="text-white font-bold" >Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="flex-1 p-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Security Settings</h2>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={userData?.email || ""}
            disabled
            className="w-full p-3 bg-gray-100 rounded-lg border-0"
          />
          <p className="text-sm text-gray-500 mt-1">
            Email cannot be changed for security reasons
          </p>
        </div>

        {/* Password */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="password"
              value="••••••••••••"
              disabled
              className="flex-1 p-3 bg-gray-100 rounded-lg border-0"
            />
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Change
            </button>
          </div>
        </div>

        {/* Account Status */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Account Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900">Verification Status</h4>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                  userData.isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {userData.isVerified
                  ? "Verified Account"
                  : "Pending Verification"}
              </span>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900">Account Status</h4>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                  userData.isActive
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {userData.isActive ? "Active Account" : "Inactive Account"}
              </span>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            Danger Zone
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
            <p className="text-sm text-red-600 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 size={16} className="mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <nav className="p-4">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <IconComponent size={20} className="mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "security" && renderSecurityTab()}
            {(activeTab === "account" ||
              activeTab === "legal" ||
              activeTab === "contact") && (
              <div className="flex-1 p-8">
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold mb-6">
                    {menuItems.find((item) => item.id === activeTab)?.label}
                  </h2>
                  <div className="text-gray-600">
                    This section is under development. Content for{" "}
                    {menuItems.find((item) => item.id === activeTab)?.label}{" "}
                    will be added soon.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const response = await authAPI.deleteAccount();
                    if (response.success) {
                      toast.success("Account deleted successfully!");
                      window.location.href = "/login";
                    } else {
                      throw new Error(
                        response.message || "Failed to delete account"
                      );
                    }
                  } catch (error) {
                    console.error("Failed to delete account:", error);
                    toast.error(
                      error.message ||
                        "Failed to delete account. Please try again."
                    );
                  } finally {
                    setIsLoading(false);
                    setShowDeleteModal(false);
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                {isLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={
                  isLoading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
