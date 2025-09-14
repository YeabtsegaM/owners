'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/utils/api';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  } | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('shopOwnerToken');
      
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        return;
      }

      // Don't verify token if we're already authenticated
      if (authState.isAuthenticated && authState.user) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Verify token with server
      const response = await apiClient.verifyToken();
      
      if (response.success && response.data && typeof response.data === 'object' && 'user' in response.data) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user as { id: string; username: string; fullName: string; role: string },
          isLoading: false
        });
      } else {
        localStorage.removeItem('shopOwnerToken');
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/') {
          router.push('/');
        }
      }
    } catch (error: unknown) {
      console.error('Auth check error:', error);
      
      // Handle different types of errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
        // Server is not available - keep user logged in if they have a token
        // This prevents logout when server is down
        const token = localStorage.getItem('shopOwnerToken');
        if (token) {
          setAuthState({
            isAuthenticated: true,
            user: null, // We don't have user data, but keep them logged in
            isLoading: false
          });
          return;
        }
      }
      
      // Handle 401 errors (login failed)
      if (errorMessage.includes('401') || errorMessage.includes('Login failed') || errorMessage.includes('check your username and password')) {
        localStorage.removeItem('shopOwnerToken');
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/') {
          router.push('/');
        }
        return;
      }
      
      // For other errors, clear token and redirect
      localStorage.removeItem('shopOwnerToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/') {
        router.push('/');
      }
    }
  }, [authState.isAuthenticated, authState.user, router]);

  useEffect(() => {
    // Small delay to ensure smooth loading
    const timer = setTimeout(() => {
      checkAuth();
    }, 50);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      // Clear any existing token first
      localStorage.removeItem('shopOwnerToken');
      
      const response = await apiClient.login(username, password);
      
      if (response.success && response.data?.token && response.data?.user) {
        localStorage.setItem('shopOwnerToken', response.data.token);
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          isLoading: false
        });

        router.push('/reports');
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
         } catch (error: unknown) {
      console.error('🔍 Login error:', error);
             const errorMessage = error instanceof Error ? error.message : String(error);
       return { 
         success: false, 
         error: errorMessage || 'Network error. Please try again.' 
       };
    }
  };

  const logout = async () => {
    try {
      // Clear token immediately to prevent race conditions
      localStorage.removeItem('shopOwnerToken');
      
      // Update state immediately
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
      
      // Try to call server logout (non-blocking)
      try {
        await apiClient.logout();
      } catch (error) {
        console.error('Server logout error:', error);
        // Continue with logout even if server call fails
      }
      
      // Redirect to login page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure we still logout even if there's an error
      router.push('/');
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth
  };
}
