'use client';

import { useState } from 'react';
import Toast from '../ui/Toast';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'error',
    isVisible: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(prev => ({ ...prev, isVisible: false }));

    const result = await onSubmit(credentials.username, credentials.password);
    if (!result.success) {
      setToast({
        message: result.error || 'Login failed. Please try again.',
        type: 'error',
        isVisible: true
      });
    }
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="max-w-xs w-full mt-0 mx-auto animate-fadeIn">
      {/* Login Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-50 rounded-full opacity-60"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-blue-50 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 -right-2 w-4 h-4 bg-purple-50 rounded-full opacity-50"></div>
        <div className="absolute top-1/4 -left-1 w-3 h-3 bg-indigo-50 rounded-full opacity-70"></div>

        {/* Shop Owner Login Title with Icon */}
        <div className="flex items-center mb-6 relative z-10">
          <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Shop Owner Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500 bg-white"
              placeholder="Username"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500 bg-white"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-3 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-sm relative overflow-hidden group"
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                <span className="text-xs">Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
            </span>
          </button>
        </form>
      </div>
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
        duration={4000}
      />
    </div>
  );
}
