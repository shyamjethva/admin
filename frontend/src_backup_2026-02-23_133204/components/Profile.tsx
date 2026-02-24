import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Building2, Briefcase, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../services/api';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { employees, updateEmployee } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    designation: user?.designation || '',
  });

  // Load existing profile image from user
  useEffect(() => {
    // Load from user.avatar first (most accurate for logged-in user)
    if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setProfileImage(base64String);

      try {
        // Call the user avatar API
        await api.put('/auth/avatar', { avatar: base64String });

        alert('Profile picture saved!');
        // Update local user state
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify({ ...user, avatar: base64String }));
        }
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        console.error('Failed to save profile image:', err);
        alert('Failed to save profile picture');
      }
    };
    reader.readAsDataURL(file);
  };

  // If the user is an employee, try to find their extra info (like phone) from the employees list
  useEffect(() => {
    if (user && employees.length > 0) {
      const employeeData = employees.find(e => e.email === user.email);
      if (employeeData) {
        setFormData(prev => ({
          ...prev,
          phone: employeeData.phone || '',
          department: employeeData.department || prev.department,
          designation: employeeData.designation || prev.designation,
        }));
      }
    }
  }, [user, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Update Auth Profile (User collection)
      await updateUser({
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
      });

      // 2. If user exists in Employees list, update that too
      const employeeEntry = employees.find(e => e.email === user?.email);
      if (employeeEntry) {
        updateEmployee(employeeEntry.id, {
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-blue-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={48} />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <span className="capitalize">{user?.role}</span> • {user?.department}
              </p>
            </div>
            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in">
                Profile updated successfully!
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter department"
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter designation"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Account ID</span>
              <span className="text-gray-900 font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Access Level</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-sm font-medium uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Security</h2>
          <p className="text-gray-600 text-sm mb-6">
            To change your password or update security settings, please contact the system administrator.
          </p>
          <button className="text-blue-600 font-medium hover:underline text-sm">
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}
