'use client';

import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ShopsReport from '@/components/reports/ShopsReport';
import CashiersReport from '@/components/reports/CashiersReport';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('shops-report');
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

  useEffect(() => {
    // Check for target section in localStorage (set when navigating from viewShopInfo)
    const targetSection = localStorage.getItem('ownersTargetSection');
    if (targetSection && (targetSection === 'shops-report' || targetSection === 'cashiers-report')) {
      setActiveSection(targetSection);
      // Clear the stored target section after using it
      localStorage.removeItem('ownersTargetSection');
    }
  }, []);

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
    <div className="min-h-screen bg-gray-200">
      <Header 
        userName={user?.username || 'Shop Owner'} 
        userRole={user?.role || 'Shop Owner'} 
        onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
      />
      <div className="flex pt-16 h-screen">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={(section) => {
            if (section === 'view-shops') {
              router.push('/viewShopInfo');
            } else {
              setActiveSection(section);
            }
          }}
          isMobileOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />
        <main className="flex-1 p-6 h-full overflow-y-auto bg-white/60 backdrop-blur-sm transition-all duration-300">
          <div className="h-full">
            {/* Dynamic Reports Content */}
            {activeSection === 'shops-report' && <ShopsReport />}
            {activeSection === 'cashiers-report' && <CashiersReport />}
          </div>
        </main>
      </div>
    </div>
  );
}
