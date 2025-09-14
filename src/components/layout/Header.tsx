'use client';

import { useState } from 'react';

import { logout } from '@/utils/logout';
import { formatRole } from '@/utils/formatRole';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onMenuToggle?: () => void;
}

export default function Header({ userName = 'Shop Owner', userRole = 'Shop Owner', onMenuToggle }: HeaderProps) {

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center h-16 px-4 lg:px-6">
        {/* Logo Section with Mobile Menu */}
        <div className="flex items-center">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-50 transition-colors mr-3"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <h1 className="text-lg lg:text-xl font-semibold text-gray-900">Bingo</h1>
        </div>
        
        {/* Desktop Profile Section */}
        <div className="hidden lg:flex items-center space-x-4 lg:space-x-6">
          {/* Profile Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-7 w-7 lg:h-8 lg:w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs lg:text-sm font-semibold text-gray-900 truncate max-w-24 lg:max-w-32">{userName}</p>
                <p className="text-xs text-gray-500">{formatRole(userRole)}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Desktop Profile Dropdown - Only Logout */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Profile Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
          >
            <div className="h-7 w-7 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet Profile Dropdown */}
        {showProfileMenu && (
          <div className="lg:hidden absolute top-16 right-4 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{formatRole(userRole)}</p>
            </div>
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Desktop Overlay */}
      {showProfileMenu && (
        <div 
          className="hidden lg:block fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
}
