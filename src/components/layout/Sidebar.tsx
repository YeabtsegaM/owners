'use client';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ 
  activeSection, 
  onSectionChange, 
  isMobileOpen = false, 
  onClose,
  isCollapsed = false,
  onToggleCollapse 
}: SidebarProps) {
  // Persist sidebar state in localStorage
  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
      // Store the new state in localStorage
      const newState = !isCollapsed;
      localStorage.setItem('ownersSidebarCollapsed', JSON.stringify(newState));
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-16 left-0 h-full z-50 
        bg-white shadow-xl border-r border-gray-200
        transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:top-0 lg:left-0
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-hidden
      `}>
        {/* Toggle Button */}
        {onToggleCollapse && (
          <div className={`flex border-b border-gray-200 ${
            isCollapsed ? 'justify-center p-2' : 'justify-end p-2'
          }`}>
            <button
              onClick={handleToggleCollapse}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <svg 
                className="w-4 h-4 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        )}
        
        <nav className={`h-full ${
          isCollapsed ? 'p-2' : 'p-4'
        } flex flex-col`}>
          {/* Reports Sub-sections */}
          {!isCollapsed && (
            <div className="text-gray-500 text-sm font-medium px-2 py-3">
              Reports
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => onSectionChange('shops-report')}
              className={`w-full text-left rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isCollapsed ? 'px-2 py-3' : 'px-3 py-2'
              } ${
                activeSection === 'shops-report'
                  ? isCollapsed 
                    ? 'bg-green-50 text-green-600 border-2 border-green-200 shadow-md' 
                    : 'bg-green-50 text-green-600 border border-green-200 shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:shadow-sm'
              }`}
              title={isCollapsed ? 'Shops Report' : undefined}
            >
              <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
                <div className={`transition-all duration-200 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                  activeSection === 'shops-report' ? 'scale-110' : 'scale-100'
                }`}>
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                {!isCollapsed && (
                  <span className={`transition-all duration-200 ${
                    activeSection === 'shops-report' ? 'font-semibold' : 'font-medium'
                  }`}>
                    Retail Report
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => onSectionChange('cashiers-report')}
              className={`w-full text-left rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isCollapsed ? 'px-2 py-3' : 'px-3 py-2'
              } ${
                activeSection === 'cashiers-report'
                  ? isCollapsed 
                    ? 'bg-green-50 text-green-600 border-2 border-green-200 shadow-md' 
                    : 'bg-green-50 text-green-600 border border-green-200 shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:shadow-sm'
              }`}
              title={isCollapsed ? 'Cashiers Report' : undefined}
            >
              <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
                <div className={`transition-all duration-200 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                  activeSection === 'cashiers-report' ? 'scale-110' : 'scale-100'
                }`}>
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {!isCollapsed && (
                  <span className={`transition-all duration-200 ${
                    activeSection === 'cashiers-report' ? 'font-semibold' : 'font-medium'
                  }`}>
                    Cashiers Report
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Line Separator */}
          <div className={`border-t border-gray-200 my-4 transition-all duration-300 hover:border-gray-300 ${
            isCollapsed ? 'mx-1' : 'mx-4'
          }`}></div>
          
          {/* View Shops Section */}
          <div className="space-y-1">
            <button
              onClick={() => onSectionChange('view-shops')}
              className={`w-full text-left rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                isCollapsed ? 'px-2 py-3' : 'px-3 py-2'
              } ${
                activeSection === 'view-shops'
                  ? isCollapsed 
                    ? 'bg-green-50 text-green-600 border-2 border-green-200 shadow-md' 
                    : 'bg-green-50 text-green-600 border border-green-200 shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:shadow-sm'
              }`}
              title={isCollapsed ? 'View Shop Info' : undefined}
            >
              <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
                <div className={`transition-all duration-200 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${
                  activeSection === 'view-shops' ? 'scale-110' : 'scale-100'
                }`}>
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {!isCollapsed && (
                  <span className={`transition-all duration-200 ${
                    activeSection === 'view-shops' ? 'font-semibold' : 'font-medium'
                  }`}>
                    View Shop Info
                  </span>
                )}
              </div>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
