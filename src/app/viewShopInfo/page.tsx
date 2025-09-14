'use client';

import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ViewShopsSection from '@/components/viewshops/ViewShopsSection';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ViewShopInfoPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState('view-shops');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Read initial state from localStorage, default to expanded (false)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ownersSidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        userName={user?.username || 'Shop Owner'} 
        userRole={user?.role || 'Shop Owner'} 
        onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
      />
      <div className="flex pt-16 h-screen">
        <Sidebar 
          activeSection={currentPage}
          onSectionChange={(section) => {
            if (section === 'shops-report' || section === 'cashiers-report') {
              // Store the target section in localStorage before navigating
              localStorage.setItem('ownersTargetSection', section);
              router.push('/reports');
            } else if (section === 'view-shops') {
              setCurrentPage('view-shops');
            } else {
              setCurrentPage(section);
            }
          }}
          isMobileOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />
        <main className="flex-1 px-6 pt-6 pb-6 h-full overflow-y-auto transition-all duration-300">
          <div className="h-full">
            <ViewShopsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
