'use client';

import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [isPageReady, setIsPageReady] = useState(false);
  const [hasShownSkeleton, setHasShownSkeleton] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth loading
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/reports');
    }
  }, [user, isLoading, router]);

  const handleLogin = async (username: string, password: string) => {
    return await login(username, password);
  };

  // Show skeleton loader only once during initial page load
  // After that, don't show it again (prevents showing during logout redirects)
  if ((isLoading || !isPageReady) && !hasShownSkeleton) {
    // Mark that we've shown the skeleton
    setHasShownSkeleton(true);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          {/* Skeleton loader to prevent dark flash */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-80 max-w-xs mx-auto">
            <div className="animate-pulse">
              {/* Title skeleton */}
              <div className="flex items-center mb-6">
                <div className="h-8 w-8 bg-gray-200 rounded-lg mr-3"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              
              {/* Input fields skeleton */}
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
          
          {/* Loading spinner below skeleton */}
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to reports
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50 flex items-start justify-center p-4 pt-20 transition-all duration-300 ease-in-out">
      {/* Login Form */}
      <LoginForm onSubmit={handleLogin} isLoading={false} />
    </div>
  );
}
