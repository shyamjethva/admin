import * as React from 'react';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Button } from './ui/button';
import { NotificationDropdown } from './NotificationDropdown';
import { useData } from '../context/DataContext';

interface HeaderProps {
  onProfileClick: () => void;
  onSettingsClick?: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ onProfileClick, onSettingsClick, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isClockActive, workingTime, toggleClock } = useData();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
          <NotificationDropdown onNavigate={onNavigate} />

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                <button
                  onClick={() => {
                    onProfileClick();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} className="text-blue-600" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onSettingsClick?.();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}