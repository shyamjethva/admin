import { useState, useEffect } from 'react';
import { Building2, Bell, Lock, User, Mail, Phone, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';

export function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    department: user?.department || 'Management',
    designation: 'Senior Manager',
  });

  // Company Settings (Admin only)
  const [companyData, setCompanyData] = useState({
    companyName: 'Error Infotech',
    industry: 'Information Technology',
    address: '123 Tech Street, Silicon Valley, CA 94025',
    phone: '+1 (555) 987-6543',
    email: 'info@errorinfotech.com',
    website: 'www.errorinfotech.com',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    leaveRequests: true,
    taskAssignments: true,
    announcements: true,
    birthdays: true,
    workAnniversaries: true,
    holidays: false,
    chatMessages: true,
  });

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('🔄 Loading settings from backend...');
        const response = await api.get('/settings');
        console.log('📥 Settings API Response:', response);
        if (response && response.data) {
          const settings = response.data.data || response.data; // Handle both response structures
          console.log('📊 Loaded settings data:', settings);
          // Load company settings
          setCompanyData({
            companyName: settings.companyName || 'Error Infotech',
            industry: settings.industry || 'Information Technology',
            address: settings.address || '',
            phone: settings.phone || '',
            email: settings.email || '',
            website: settings.website || '',
            timezone: settings.timezone || 'Asia/Kolkata',
            currency: settings.currency || 'INR',
          });
          // Load notification settings
          if (settings.notificationSettings) {
            setNotificationSettings(settings.notificationSettings);
          }
        }
      } catch (error) {
        console.error('❌ Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Update profile data when user changes
  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      designation: user?.designation || '',
    });
  }, [user]);

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
        designation: profileData.designation,
      });
      await updateUser({
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
        designation: profileData.designation,
      });
      toast.success('Profile settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySave = async () => {
    setLoading(true);
    try {
      console.log('💾 Saving company settings:', companyData);
      const response = await api.put('/settings/company', companyData);
      console.log('📤 Save response:', response);
      toast.success('Company settings updated successfully!');
    } catch (error: any) {
      console.error('❌ Failed to save company settings:', error);
      toast.error(error?.response?.data?.message || 'Failed to save company settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    try {
      await api.put('/settings/notifications', notificationSettings);
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save notifications');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      });
      toast.success('Password changed successfully!');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'profile'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <User size={18} />
            Profile
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'company'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Building2 size={18} />
              Company
            </button>
          )}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'notifications'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Bell size={18} />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'security'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Lock size={18} />
            Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    <input
                      type="text"
                      value={profileData.designation}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleProfileSave}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Company Settings (Admin only) */}
          {activeTab === 'company' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      value={companyData.industry}
                      onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="text"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={companyData.timezone}
                      onChange={(e) => setCompanyData({ ...companyData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={companyData.currency}
                      onChange={(e) => setCompanyData({ ...companyData, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleCompanySave}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email notifications for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Leave Requests</p>
                      <p className="text-sm text-gray-600">Get notified about leave request updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.leaveRequests}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, leaveRequests: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Task Assignments</p>
                      <p className="text-sm text-gray-600">Receive notifications when tasks are assigned to you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.taskAssignments}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, taskAssignments: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Announcements</p>
                      <p className="text-sm text-gray-600">Get notified about company announcements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.announcements}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, announcements: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Birthdays & Anniversaries</p>
                      <p className="text-sm text-gray-600">Receive notifications about upcoming birthdays and work anniversaries</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.birthdays}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, birthdays: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Chat Messages</p>
                      <p className="text-sm text-gray-600">Get notified about new messages in WhatChat</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.chatMessages}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, chatMessages: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleNotificationSave}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Lock size={18} />
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
