"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { restaurantAPI, authAPI } from '@/libs/api';
import UserProfilePage from '../layout/UserProfilePage';
import {
  Loader2,
  User,
  Building2,
  Clock,
  Settings,
  Save,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';

export default function AccountSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Restaurant Info State - Enhanced with more fields
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    description: '',
    cuisineType: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
    email: '',
    businessLicense: '',
    tags: []
  });

  // Operating Hours State - Updated to match onboarding format
  const [operatingHours, setOperatingHours] = useState({
    0: { open: 1000, close: 2100, isClosed: false }, // Sunday
    1: { open: 1100, close: 2200, isClosed: false }, // Monday
    2: { open: 1100, close: 2200, isClosed: false }, // Tuesday
    3: { open: 1100, close: 2200, isClosed: false }, // Wednesday
    4: { open: 1100, close: 2300, isClosed: false }, // Thursday
    5: { open: 1100, close: 2300, isClosed: false }, // Friday
    6: { open: 1000, close: 2300, isClosed: false }, // Saturday
  });

  // Business Settings State - Enhanced with all onboarding fields
  const [businessSettings, setBusinessSettings] = useState({
    deliveryFee: 0,
    minimumOrder: 0,
    averageDeliveryTime: 30,
    maxOrdersPerHour: 20,
    deliveryRadius: 5.0,
    autoAcceptOrders: false,
    acceptCashPayments: true,
    acceptCardPayments: true
  });

  // UI State
  const [profileImage, setProfileImage] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState({
    profile: false,
    restaurant: false,
    hours: false,
    business: false
  });
  const [saving, setSaving] = useState({
    profile: false,
    restaurant: false,
    hours: false,
    business: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'restaurant', name: 'Restaurant Info', icon: Building2 },
    { id: 'hours', name: 'Operating Hours', icon: Clock },
    { id: 'business', name: 'Business Settings', icon: Settings },
  ];

  const daysOfWeek = [
    { key: 1, label: 'Monday', index: 1 },
    { key: 2, label: 'Tuesday', index: 2 },
    { key: 3, label: 'Wednesday', index: 3 },
    { key: 4, label: 'Thursday', index: 4 },
    { key: 5, label: 'Friday', index: 5 },
    { key: 6, label: 'Saturday', index: 6 },
    { key: 0, label: 'Sunday', index: 0 },
  ];

  // Cuisine types from onboarding
  const cuisineTypes = [
    'French', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai',
    'Mediterranean', 'American', 'Greek', 'Korean', 'Vietnamese', 'Lebanese',
    'Spanish', 'Turkish', 'Brazilian', 'Ethiopian', 'Other'
  ];

  // Available tags from onboarding
  const availableTags = [
    'fine-dining', 'casual-dining', 'fast-food', 'family-friendly', 'romantic',
    'vegetarian', 'vegan', 'gluten-free', 'organic', 'local-ingredients',
    'pizza', 'burgers', 'seafood', 'steakhouse', 'bakery', 'cafe', 'bar',
    'takeaway', 'delivery-only', 'halal', 'kosher', 'breakfast', 'brunch', 'late-night'
  ];

  // Time conversion functions from onboarding
  const timeStringToNumber = (timeString) => {
    if (!timeString) return 1100;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  };

  const timeNumberToString = (timeNumber) => {
    if (!timeNumber) return '11:00';
    const hours = Math.floor(timeNumber / 100);
    const minutes = timeNumber % 100;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Load restaurant data on component mount
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (user?.userType !== 'restaurant_owner') {
        setLoading(false);
        return;
      }

      try {
        const response = await restaurantAPI.getOwnerRestaurant();
        
        if (response.success && response.restaurant) {
          const restaurantData = response.restaurant;
          setRestaurant(restaurantData);
          
          // Update restaurant info state
          setRestaurantInfo({
            name: restaurantData.name || '',
            description: restaurantData.description || '',
            cuisineType: restaurantData.cuisineType || '',
            address: restaurantData.address || '',
            city: restaurantData.city || '',
            postalCode: restaurantData.postalCode || '',
            country: restaurantData.country || 'France',
            phone: restaurantData.phone || '',
            email: restaurantData.email || '',
            businessLicense: restaurantData.businessLicense || '',
            tags: restaurantData.tags || []
          });

          // Update operating hours if available
          if (restaurantData.openingHours) {
            setOperatingHours(restaurantData.openingHours);
          }

          // Update business settings - Parse string values from backend
          setBusinessSettings(prev => ({
            ...prev,
            deliveryFee: parseFloat(restaurantData.deliveryFee) || prev.deliveryFee,
            minimumOrder: parseFloat(restaurantData.minimumOrder) || prev.minimumOrder,
            averageDeliveryTime: parseInt(restaurantData.averageDeliveryTime) || prev.averageDeliveryTime
          }));
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        setError('Failed to load restaurant data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [user]);

  // Handle form changes
  const handleRestaurantInfoChange = (field, value) => {
    setRestaurantInfo(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(prev => ({ ...prev, restaurant: true }));
  };

  const handleOperatingHoursChange = (dayIndex, field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: field === 'isClosed' ? value : 
                field === 'open' || field === 'close' ? timeStringToNumber(value) : value
      }
    }));
    setUnsavedChanges(prev => ({ ...prev, hours: true }));
  };

  const handleBusinessSettingsChange = (field, value) => {
    setBusinessSettings(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(prev => ({ ...prev, business: true }));
  };

  const handleTagToggle = (tag) => {
    setRestaurantInfo(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : prev.tags.length < 10 ? [...prev.tags, tag] : prev.tags
    }));
    setUnsavedChanges(prev => ({ ...prev, restaurant: true }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        setUnsavedChanges(prev => ({ ...prev, restaurant: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save functions for each tab
  const handleSaveRestaurant = async () => {
    setSaving(prev => ({ ...prev, restaurant: true }));
    try {
      const updateData = {
        name: restaurantInfo.name.trim(),
        description: restaurantInfo.description.trim() || undefined,
        cuisineType: restaurantInfo.cuisineType || undefined,
        phone: restaurantInfo.phone.trim() || undefined,
        email: restaurantInfo.email.trim() || undefined,
        address: restaurantInfo.address.trim(),
        city: restaurantInfo.city.trim(),
        postalCode: restaurantInfo.postalCode.trim(),
        country: restaurantInfo.country,
        tags: restaurantInfo.tags.length > 0 ? restaurantInfo.tags : undefined
      };

      const response = await restaurantAPI.updateRestaurantProfile(updateData);
      
      if (response.success) {
        setUnsavedChanges(prev => ({ ...prev, restaurant: false }));
        setError('');
      }
    } catch (error) {
      console.error('Error saving restaurant info:', error);
      setError('Failed to save restaurant information. Please try again.');
    } finally {
      setSaving(prev => ({ ...prev, restaurant: false }));
    }
  };

  const handleSaveHours = async () => {
    setSaving(prev => ({ ...prev, hours: true }));
    try {
      const response = await restaurantAPI.updateRestaurantProfile({
        openingHours: operatingHours
      });
      
      if (response.success) {
        setUnsavedChanges(prev => ({ ...prev, hours: false }));
        setError('');
      }
    } catch (error) {
      console.error('Error saving operating hours:', error);
      setError('Failed to save operating hours. Please try again.');
    } finally {
      setSaving(prev => ({ ...prev, hours: false }));
    }
  };

  const handleSaveBusiness = async () => {
    setSaving(prev => ({ ...prev, business: true }));
    try {
      const response = await restaurantAPI.updateRestaurantProfile({
        deliveryFee: Number(businessSettings.deliveryFee),
        minimumOrder: Number(businessSettings.minimumOrder),
        averageDeliveryTime: Number(businessSettings.averageDeliveryTime)
      });
      
      if (response.success) {
        setUnsavedChanges(prev => ({ ...prev, business: false }));
        setError('');
      }
    } catch (error) {
      console.error('Error saving business settings:', error);
      setError('Failed to save business settings. Please try again.');
    } finally {
      setSaving(prev => ({ ...prev, business: false }));
    }
  };

  const renderRestaurantInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Restaurant" 
                className="w-full h-full object-cover rounded-xl" 
              />
            ) : restaurantInfo.name ? (
              restaurantInfo.name.charAt(0)
            ) : (
              'R'
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={restaurantInfo.name}
              onChange={(e) => handleRestaurantInfoChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter restaurant name"
              required
            />
            <p className="mt-1 text-xs text-gray-500">2-100 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
            <select
              value={restaurantInfo.cuisineType}
              onChange={(e) => handleRestaurantInfoChange('cuisineType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select cuisine type</option>
              {cuisineTypes.map((cuisine) => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={restaurantInfo.description}
          onChange={(e) => handleRestaurantInfoChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="4"
          placeholder="Tell customers about your restaurant..."
        />
        <p className="mt-1 text-xs text-gray-500">Maximum 1000 characters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={restaurantInfo.address}
            onChange={(e) => handleRestaurantInfoChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="123 Rue de la Paix"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Maximum 500 characters</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={restaurantInfo.city}
                onChange={(e) => handleRestaurantInfoChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paris"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={restaurantInfo.postalCode}
                onChange={(e) => handleRestaurantInfoChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="75001"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={restaurantInfo.country}
              onChange={(e) => handleRestaurantInfoChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="France">France</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Phone</label>
          <input
            type="tel"
            value={restaurantInfo.phone}
            onChange={(e) => handleRestaurantInfoChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+33123456789"
          />
          <p className="mt-1 text-xs text-gray-500">International format</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Email</label>
          <input
            type="email"
            value={restaurantInfo.email}
            onChange={(e) => handleRestaurantInfoChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="contact@restaurant.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business License</label>
        <input
          type="text"
          value={restaurantInfo.businessLicense}
          onChange={(e) => handleRestaurantInfoChange('businessLicense', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          readOnly={true}
          placeholder="Business License Number"
        />
        <p className="mt-1 text-xs text-gray-500">Maximum 100 characters</p>
      </div>

      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant Tags (max 10)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Select tags that describe your restaurant
        </p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              disabled={!restaurantInfo.tags.includes(tag) && restaurantInfo.tags.length >= 10}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                restaurantInfo.tags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : restaurantInfo.tags.length >= 10
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {restaurantInfo.tags.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Selected tags ({restaurantInfo.tags.length}/10):</strong>{' '}
              {restaurantInfo.tags.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOperatingHours = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <AlertCircle size={16} className="mr-2" />
          Operating Hours Tips
        </h4>
        <p className="text-sm text-blue-700">
          Set accurate hours to help customers know when you're available. You can temporarily close during holidays or special events.
        </p>
      </div>

      <div className="space-y-4">
        {daysOfWeek.map((day) => {
          const dayData = operatingHours[day.index];
          return (
            <div
              key={day.index}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl"
            >
              <div className="w-20">
                <span className="font-medium text-gray-900">{day.label}</span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={dayData.isClosed}
                  onChange={(e) =>
                    handleOperatingHoursChange(day.index, 'isClosed', e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Closed</label>
              </div>

              {!dayData.isClosed && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Open</label>
                    <input
                      type="time"
                      value={timeNumberToString(dayData.open)}
                      onChange={(e) =>
                        handleOperatingHoursChange(day.index, 'open', e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Close</label>
                    <input
                      type="time"
                      value={timeNumberToString(dayData.close)}
                      onChange={(e) =>
                        handleOperatingHoursChange(day.index, 'close', e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Time Format</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Opening hours use 24-hour format. Changes will be reflected immediately for customers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Fee (€)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.01"
            value={businessSettings.deliveryFee}
            onChange={(e) =>
              handleBusinessSettingsChange('deliveryFee', parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2.50"
          />
          <p className="text-xs text-gray-500 mt-1">0-50 euros</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Order (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={businessSettings.minimumOrder}
            onChange={(e) =>
              handleBusinessSettingsChange('minimumOrder', parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="15.00"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum order amount</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preparation Time (min)
          </label>
          <input
            type="number"
            min="10"
            max="120"
            value={businessSettings.averageDeliveryTime}
            onChange={(e) =>
              handleBusinessSettingsChange('averageDeliveryTime', parseInt(e.target.value) || 30)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="30"
          />
          <p className="text-xs text-gray-500 mt-1">10-120 minutes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Orders Per Hour
          </label>
          <input
            type="number"
            min="1"
            value={businessSettings.maxOrdersPerHour}
            onChange={(e) =>
              handleBusinessSettingsChange('maxOrdersPerHour', parseInt(e.target.value) || 20)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Limit orders to maintain quality</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Radius (km)
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={businessSettings.deliveryRadius}
            onChange={(e) =>
              handleBusinessSettingsChange('deliveryRadius', parseFloat(e.target.value) || 5.0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum delivery distance</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Business Settings Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                These settings affect how orders are processed and delivered. Adjust them based on your restaurant's capacity and location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UserProfilePage />;
      case 'restaurant':
        return renderRestaurantInfo();
      case 'hours':
        return renderOperatingHours();
      case 'business':
        return renderBusinessSettings();
      default:
        return <UserProfilePage />;
    }
  };

  const getSaveHandler = () => {
    switch (activeTab) {
      case 'restaurant':
        return handleSaveRestaurant;
      case 'hours':
        return handleSaveHours;
      case 'business':
        return handleSaveBusiness;
      default:
        return null; // Profile tab handles its own saving
    }
  };

  const hasUnsavedChanges = () => {
    switch (activeTab) {
      case 'restaurant':
        return unsavedChanges.restaurant;
      case 'hours':
        return unsavedChanges.hours;
      case 'business':
        return unsavedChanges.business;
      default:
        return false;
    }
  };

  const isSaving = () => {
    switch (activeTab) {
      case 'restaurant':
        return saving.restaurant;
      case 'hours':
        return saving.hours;
      case 'business':
        return saving.business;
      default:
        return false;
    }
  };

  // Validation functions
  const validateRestaurantInfo = () => {
    const errors = [];
    
    if (!restaurantInfo.name || restaurantInfo.name.length < 2) {
      errors.push('Restaurant name must be at least 2 characters long');
    }
    if (restaurantInfo.name && restaurantInfo.name.length > 100) {
      errors.push('Restaurant name cannot exceed 100 characters');
    }
    if (!restaurantInfo.address) {
      errors.push('Address is required');
    }
    if (!restaurantInfo.city) {
      errors.push('City is required');
    }
    if (!restaurantInfo.postalCode) {
      errors.push('Postal code is required');
    }
    if (restaurantInfo.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(restaurantInfo.phone)) {
      errors.push('Please provide a valid phone number');
    }
    if (restaurantInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(restaurantInfo.email)) {
      errors.push('Please provide a valid email address');
    }
    
    return errors;
  };

  const validateBusinessSettings = () => {
    const errors = [];
    
    if (businessSettings.deliveryFee < 0 || businessSettings.deliveryFee > 50) {
      errors.push('Delivery fee must be between 0 and 50');
    }
    if (businessSettings.minimumOrder < 0) {
      errors.push('Minimum order cannot be negative');
    }
    if (businessSettings.averageDeliveryTime < 10 || businessSettings.averageDeliveryTime > 120) {
      errors.push('Average delivery time must be between 10 and 120 minutes');
    }
    
    return errors;
  };

  // Enhanced save functions with validation
  const handleSaveRestaurantWithValidation = async () => {
    const errors = validateRestaurantInfo();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    await handleSaveRestaurant();
  };

  const handleSaveBusinessWithValidation = async () => {
    const errors = validateBusinessSettings();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    await handleSaveBusiness();
  };

  const getValidatedSaveHandler = () => {
    switch (activeTab) {
      case 'restaurant':
        return handleSaveRestaurantWithValidation;
      case 'hours':
        return handleSaveHours;
      case 'business':
        return handleSaveBusinessWithValidation;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        {hasUnsavedChanges() && getValidatedSaveHandler() && (
          <button
            onClick={getValidatedSaveHandler()}
            disabled={isSaving()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving() ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle size={16} className="text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              You have unsaved changes. Don't forget to save your updates!
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle size={16} className="text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{tab.name}</span>
                  {/* Show unsaved indicator */}
                  {((tab.id === 'restaurant' && unsavedChanges.restaurant) ||
                    (tab.id === 'hours' && unsavedChanges.hours) ||
                    (tab.id === 'business' && unsavedChanges.business)) && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}