'use client';

import { useState } from 'react';
import { Moon, Sun, User, LogOut, Settings, BookOpen } from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

const ProfileDropdown = ({ isOpen, onClose, userName = "John Doe", userEmail = "john@example.com" }: ProfileDropdownProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{userName}</p>
            <p className="text-gray-600 dark:text-gray-300 text-xs">{userEmail}</p>
          </div>
        </div>
      </div>
      
      <div className="py-2">
        <button className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">My Progress</span>
        </button>
        <hr className="my-2 border-gray-200 dark:border-gray-600" />
        <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close profile dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (target && !document.querySelector('.profile-container')?.contains(target)) {
      setIsProfileOpen(false);
    }
  };

  // Add event listener for outside clicks
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              You Education
            </span>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative profile-container">
              <button
                onClick={toggleProfile}
                className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 group"
                aria-label="User profile"
              >
                <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
              </button>
              
              <ProfileDropdown 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;