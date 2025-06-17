// components/restaurant/AccountSettings.js
"use client";
import { useState, useEffect } from 'react';

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Bella Vista Restaurant',
    email: 'owner@bellavista.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Downtown, City, State 12345',
    description: 'Authentic Italian cuisine with a modern twist. Family-owned restaurant serving the community for over 10 years.',
    cuisine: 'Italian',
    priceRange: '$$',
    website: 'https://bellavista.com',
    established: '2014'
  });

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '22:00', isOpen: true },
    tuesday: { open: '09:00', close: '22:00', isOpen: true },
    wednesday: { open: '09:00', close: '22:00', isOpen: true },
    thursday: { open: '09:00', close: '22:00', isOpen: true },
    friday: { open: '09:00', close: '23:00', isOpen: true },
    saturday: { open: '10:00', close: '23:00', isOpen: true },
    sunday: { open: '10:00', close: '21:00', isOpen: true }
  });

  const [businessSettings, setBusinessSettings] = useState({
    autoAcceptOrders: true,
    maxOrdersPerHour: 20,
    preparationTime: 25,
    deliveryRadius: 5,
    minimumOrderValue: 15,
    deliveryFee: 2.99,
    acceptCashPayments: true,
    acceptCardPayments: true,
    enableNotifications: true,
    enableSMSNotifications: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginNotifications: true
  });

  const [profileImage, setProfileImage] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const tabs = [
    { id: 'restaurant', name: 'Restaurant Info', icon: '🏪' },
    { id: 'hours', name: 'Operating Hours', icon: '⏰' },
    { id: 'business', name: 'Business Settings', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleRestaurantInfoChange = (field, value) => {
    setRestaurantInfo(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
    setUnsavedChanges(true);
  };

  const handleBusinessSettingsChange = (field, value) => {
    setBusinessSettings(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    // TODO: Implement API call to save changes
    console.log('Saving changes...', {
      restaurantInfo,
      operatingHours,
      businessSettings
    });
    
    // Simulate API call
    setTimeout(() => {
      setUnsavedChanges(false);
      alert('Changes saved successfully!');
    }, 1000);
  };

  const handlePasswordChange = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (securitySettings.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    // TODO: Implement password change API call
    console.log('Changing password...');
    alert('Password changed successfully!');
    setSecuritySettings(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        setUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderRestaurantInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            {profileImage ? (
              <img src={profileImage} alt="Restaurant" className="w-full h-full object-cover rounded-xl" />
            ) : (
              restaurantInfo.name.charAt(0)
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
          <select
            value={restaurantInfo.cuisine}
            onChange={(e) => handleRestaurantInfoChange('cuisine', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Italian">Italian</option>
            <option value="Chinese">Chinese</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
            <option value="American">American</option>
            <option value="Japanese">Japanese</option>
            <option value="French">French</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Thai">Thai</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
          <select
            value={restaurantInfo.priceRange}
            onChange={(e) => handleRestaurantInfoChange('priceRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="$">$ (Under $15)</option>
            <option value="$">$ ($15-30)</option>
            <option value="$$">$$ ($30-50)</option>
            <option value="$$">$$ ($50+)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          value={restaurantInfo.address}
          onChange={(e) => handleRestaurantInfoChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="2"
        />
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
      </div>
    </div>
  );

  const renderOperatingHours = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Operating Hours Tips</h4>
        <p className="text-sm text-blue-700">
          Set accurate hours to help customers know when you're available. You can temporarily close during holidays or special events.
        </p>
      </div>

      <div className="space-y-4">
        {daysOfWeek.map((day) => (
          <div key={day.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700">{day.label}</div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={operatingHours[day.key].isOpen}
                  onChange={(e) => handleOperatingHoursChange(day.key, 'isOpen', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Open</span>
              </label>
            </div>
            
            {operatingHours[day.key].isOpen && (
              <div className="flex items-center space-x-3">
                <input
                  type="time"
                  value={operatingHours[day.key].open}
                  onChange={(e) => handleOperatingHoursChange(day.key, 'open', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={operatingHours[day.key].close}
                  onChange={(e) => handleOperatingHoursChange(day.key, 'close', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            )}
            
            {!operatingHours[day.key].isOpen && (
              <span className="text-sm text-gray-500 italic">Closed</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">⚠️ Special Hours</h4>
        <p className="text-sm text-yellow-700 mb-3">
          Need to close temporarily? You can set special hours for holidays or events.
        </p>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
          Set Special Hours
        </button>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Orders Per Hour</label>
          <input
            type="number"
            value={businessSettings.maxOrdersPerHour}
            onChange={(e) => handleBusinessSettingsChange('maxOrdersPerHour', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">Limit orders to maintain quality</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Average Preparation Time (minutes)</label>
          <input
            type="number"
            value={businessSettings.preparationTime}
            onChange={(e) => handleBusinessSettingsChange('preparationTime', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="5"
          />
          <p className="text-xs text-gray-500 mt-1">Estimated time to prepare orders</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (miles)</label>
          <input
            type="number"
            value={businessSettings.deliveryRadius}
            onChange={(e) => handleBusinessSettingsChange('deliveryRadius', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0.5"
            step="0.5"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum delivery distance</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value ($)</label>
          <input
            type="number"
            value={businessSettings.minimumOrderValue}
            onChange={(e) => handleBusinessSettingsChange('minimumOrderValue', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.50"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum amount for delivery orders</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
          <input
            type="number"
            value={businessSettings.deliveryFee}
            onChange={(e) => handleBusinessSettingsChange('deliveryFee', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.25"
          />
          <p className="text-xs text-gray-500 mt-1">Standard delivery charge</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Order Management</h4>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={businessSettings.autoAcceptOrders}
            onChange={(e) => handleBusinessSettingsChange('autoAcceptOrders', e.target.checked)}
            className="mr-3"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Auto-accept orders</span>
            <p className="text-xs text-gray-500">Automatically accept orders when restaurant is open</p>
          </div>
        </label>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Payment Methods</h4>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={businessSettings.acceptCashPayments}
            onChange={(e) => handleBusinessSettingsChange('acceptCashPayments', e.target.checked)}
            className="mr-3"
          />
          <span className="text-sm font-medium text-gray-700">Accept cash payments</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={businessSettings.acceptCardPayments}
            onChange={(e) => handleBusinessSettingsChange('acceptCardPayments', e.target.checked)}
            className="mr-3"
          />
          <span className="text-sm font-medium text-gray-700">Accept card payments</span>
        </label>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium text-red-900 mb-2">🔒 Security Best Practices</h4>
        <ul className="text-sm text-red-700 space-y-1">
          <li>• Use a strong password with at least 8 characters</li>
          <li>• Include uppercase, lowercase, numbers, and symbols</li>
          <li>• Enable two-factor authentication for extra security</li>
          <li>• Never share your login credentials</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={securitySettings.currentPassword}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={securitySettings.newPassword}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={securitySettings.confirmPassword}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Security Settings</h4>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.twoFactorEnabled}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                className="ml-3"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Login Notifications</span>
                <p className="text-xs text-gray-500">Get notified of new logins</p>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.loginNotifications}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginNotifications: e.target.checked }))}
                className="ml-3"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            Deactivate Account
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Download Data
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">🔔 Stay Updated</h4>
        <p className="text-sm text-blue-700">
          Choose how you want to receive notifications about orders, customers, and important updates.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Order Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">New Order Alerts</span>
                <p className="text-xs text-gray-500">Get notified when new orders come in</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Order Status Updates</span>
                <p className="text-xs text-gray-500">Updates when orders are picked up or delivered</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Customer Messages</span>
                <p className="text-xs text-gray-500">When customers send messages or special requests</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Business Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Low Stock Alerts</span>
                <p className="text-xs text-gray-500">When menu items are running low</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Daily Sales Summary</span>
                <p className="text-xs text-gray-500">End-of-day sales and performance report</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Weekly Analytics</span>
                <p className="text-xs text-gray-500">Weekly performance and insights</p>
              </div>
              <input type="checkbox" className="ml-3" />
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">System Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Platform Updates</span>
                <p className="text-xs text-gray-500">New features and system updates</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Maintenance Notices</span>
                <p className="text-xs text-gray-500">Scheduled maintenance and downtime</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Security Alerts</span>
                <p className="text-xs text-gray-500">Important security notifications</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Delivery Methods</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                <p className="text-xs text-gray-500">Receive urgent alerts via text message</p>
              </div>
              <input type="checkbox" className="ml-3" />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                <p className="text-xs text-gray-500">Browser notifications for real-time alerts</p>
              </div>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'restaurant': return renderRestaurantInfo();
      case 'hours': return renderOperatingHours();
      case 'business': return renderBusinessSettings();
      case 'security': return renderSecurity();
      case 'notifications': return renderNotifications();
      default: return renderRestaurantInfo();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        {unsavedChanges && (
          <button
            onClick={handleSaveChanges}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        )}
      </div>

      {unsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">You have unsaved changes. Don't forget to save your updates!</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
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
