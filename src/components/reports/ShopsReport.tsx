'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable, { Column } from '@/components/ui/DataTable';
import DateRangePicker, { DateRange } from '@/components/ui/DateRangePicker';
import { apiClient } from '@/utils/api';

interface ShopReportData extends Record<string, unknown> {
  _id: string;
  shopName: string;
  tickets: number;
  bets: number;
  unclaimed: number;
  redeemed: number;
  unclaimedCount: number;
  redeemCount: number;
  ggr: number;
  netBalance: number;
  lastUpdated: string;
}

interface Shop {
  _id: string;
  name?: string;
  shopName?: string;
  ownerId?: string;
  ownerName?: string;
  owner?: string;
  shopOwner?: string;
  tickets?: number;
  totalTickets?: number;
  bets?: number;
  totalBets?: number;
  amount?: number;
  unclaimed?: number;
  pendingAmount?: number;
  pending?: number;
  redeemed?: number;
  claimedAmount?: number;
  claimed?: number;
  updatedAt?: string;
  lastUpdated?: string;
}

interface CashierData {
  cashierId?: string;
  _id?: string;
  cashierName?: string;
  fullName?: string;
  username?: string;
  tickets?: number;
  bets?: number;
  unclaimed?: number;
  redeemed?: number;
  netBalance?: number;
  unclaimedCount?: number;
  redeemCount?: number;
}

// Custom Dropdown Component
interface CustomDropdownProps {
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

function CustomDropdown({ options, value, onChange, placeholder = "Select..." }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 min-w-[120px]"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <svg 
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors duration-150 ${
                option.value === value 
                  ? 'bg-green-50 text-green-700 font-medium' 
                  : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopsReport() {
  const { user } = useAuth();
  const [data, setData] = useState<ShopReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Set default date range to last 30 days
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return { 
      from: thirtyDaysAgo, 
      to: today 
    };
  });

  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rawData, setRawData] = useState<ShopReportData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic - show one shop per page
  const shopsPerPage = 1;
  const totalPages = Math.max(1, Math.ceil(data.length / shopsPerPage));
  const startIndex = (currentPage - 1) * shopsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + shopsPerPage);

  // Calculate summary totals from the current shop only
  const calculateSummaryTotals = () => {
    const currentShop = paginatedData[0]; // Get the current shop being displayed
    if (!currentShop) {
      return {
        netBalance: 0,
        tickets: 0,
        grossStake: 0,
        claimedWinning: 0
      };
    }
    
    return {
      netBalance: currentShop.netBalance || 0,
      tickets: currentShop.tickets || 0,
      grossStake: currentShop.bets || 0,
      claimedWinning: currentShop.redeemed || 0
    };
  };

  const summaryTotals = calculateSummaryTotals();

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Remove automatic data loading - data will be loaded only when user clicks on this report
  // useEffect(() => {
  //   fetchShopData();
  // }, [user?.id, user?.username]);

     



  const fetchShopData = async () => {
    try {
      setIsLoading(true);
      
      // Reset pagination when refreshing data
      setCurrentPage(1);
      
      // Get all shops and filter by current user
      const response = await apiClient.getShops();
      
      if (response.success) {
        // Filter shops to only show those belonging to the current shop owner
        const shopsData = Array.isArray(response.data) ? response.data : [];
        
        const userShops = shopsData.filter((shop: Shop) => {
          // Check if shop belongs to current user
          const isOwner = shop.ownerId === user?.id || 
                         shop.ownerName === user?.username || 
                         shop.owner === user?.username ||
                         shop.shopOwner === user?.username ||
                         (shop.owner && typeof shop.owner === 'object' && 'username' in shop.owner && (shop.owner as { username: string }).username === user?.username);
          
          return isOwner;
        });
        
        if (userShops.length === 0) {
          // No shops found for this user
          setData([]);
          return;
        }
        
        // Transform the filtered data to match the table structure
        // We'll aggregate cashier data for each shop
        const transformedData: ShopReportData[] = [];
        
        // Fetch real cashier data for each shop and aggregate it
        for (let i = 0; i < userShops.length; i++) {
          const shop = userShops[i];
          const shopName = shop.name || shop.shopName || 'Unknown Shop';
          
          try {
            // Try to fetch cashiers for this specific shop from balance endpoint
            // Pass date range parameters for filtering
            const startDate = dateRange.from ? dateRange.from.toISOString().split('T')[0] : '';
            const endDate = dateRange.to ? dateRange.to.toISOString().split('T')[0] : '';
            
            const cashiersResponse = await apiClient.getShopCashiers(shop._id, startDate, endDate);
            
            if (cashiersResponse.success && cashiersResponse.data) {
              const cashiersData = Array.isArray(cashiersResponse.data) ? cashiersResponse.data : [];
              
              if (cashiersData.length > 0) {
                // Aggregate all cashier data for this shop
                const shopTotalTickets = cashiersData.reduce((sum, cashier: CashierData) => sum + (cashier.tickets || 0), 0);
                const shopTotalBets = cashiersData.reduce((sum, cashier: CashierData) => sum + (cashier.bets || 0), 0);
                const shopTotalUnclaimed = cashiersData.reduce((sum, cashier: CashierData) => sum + (cashier.unclaimed || 0), 0);
                const shopTotalRedeemed = cashiersData.reduce((sum, cashier: CashierData) => sum + (cashier.redeemed || 0), 0);
                const shopNetBalance = shopTotalBets - shopTotalRedeemed;
                              // Use the actual counts from backend instead of calculating incorrectly
                const unclaimedCount = cashiersData.reduce((sum, cashier: CashierData) => sum + (cashier.unclaimedCount || 0), 0);
                const redeemCount = cashiersData.reduce((sum, cashier: CashierData) => sum + (cashier.redeemCount || 0), 0);
                const ggr = shopNetBalance - shopTotalUnclaimed;
                
                transformedData.push({
                  _id: shop._id,
                  shopName: shopName,
                  tickets: shopTotalTickets,
                  bets: shopTotalBets,
                  unclaimed: shopTotalUnclaimed,
                  redeemed: shopTotalRedeemed,
                  unclaimedCount: unclaimedCount,
                  redeemCount: redeemCount,
                  ggr: ggr,
                  netBalance: shopNetBalance,
                  lastUpdated: new Date().toISOString(),
                  rowIndex: i + 1
                });
              } else {
                // Shop has no cashiers - show zero values
                transformedData.push({
                  _id: shop._id,
                  shopName: shopName,
                  tickets: 0,
                  bets: 0,
                  unclaimed: 0,
                  redeemed: 0,
                  unclaimedCount: 0,
                  redeemCount: 0,
                  ggr: 0,
                  netBalance: 0,
                  lastUpdated: new Date().toISOString(),
                  rowIndex: i + 1
                });
              }
            } else {
              // Fallback: shop has no cashiers - show zero values
              transformedData.push({
                _id: shop._id,
                shopName: shopName,
                tickets: 0,
                bets: 0,
                unclaimed: 0,
                redeemed: 0,
                unclaimedCount: 0,
                redeemCount: 0,
                ggr: 0,
                netBalance: 0,
                lastUpdated: new Date().toISOString(),
                rowIndex: i + 1
              });
            }
          } catch (error) {
            // Error occurred - show zero values
            console.error('Error fetching cashier data for shop:', shopName, error);
            transformedData.push({
              _id: shop._id,
              shopName: shopName,
              tickets: 0,
              bets: 0,
              unclaimed: 0,
              redeemed: 0,
              unclaimedCount: 0,
              redeemCount: 0,
              ggr: 0,
              netBalance: 0,
              lastUpdated: new Date().toISOString(),
              rowIndex: i + 1
            });
          }
        }
        
        setRawData(transformedData);
        setData(transformedData);
      } else {
        // API call succeeded but returned error
        setRawData([]);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      // Show empty state for any errors
      setRawData([]);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on date range
  const filterDataByDateRange = () => {
    if (!rawData.length) return;
    
    // Since we're now fetching data with date filters from the API,
    // we can show all the filtered data
    setData(rawData);
  };

  // Update data when date range changes
  React.useEffect(() => {
    if (rawData.length > 0) {
      filterDataByDateRange();
    }
  }, [dateRange, rawData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refetch data when date range changes
  React.useEffect(() => {
    if (data.length > 0) {
      fetchShopData();
    }
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    
    // Sort the data based on the key and direction
    const sortedData = [...data].sort((a, b) => {
      let aValue = a[key as keyof ShopReportData];
      let bValue = b[key as keyof ShopReportData];
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle mixed types or null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? -1 : 1;
      if (bValue == null) return direction === 'asc' ? 1 : -1;
      
      return 0;
    });
    
    setData(sortedData);
    // Reset pagination to page 1 when sorting changes
    setCurrentPage(1);
  };



  const columns: Column<ShopReportData>[] = [
    {
      key: 'index',
      label: 'NO.',
      sortable: false,
      render: (value: unknown, row: ShopReportData) => (
        <div className="text-xs text-gray-500">
           {(row as { rowIndex?: number }).rowIndex !== undefined ? (row as { rowIndex?: number }).rowIndex : ''}
        </div>
      )
    },
    {
      key: 'shopName',
      label: 'SHOP',
      sortable: true,
      render: (value: unknown, row: ShopReportData) => (
        <div className="text-xs font-medium text-gray-900">
          {row.shopName || 'Unknown Shop'}
        </div>
      )
    },
         {
       key: 'tickets',
       label: 'TICKETS',
       sortable: true,
       render: (value: unknown) => {
         const numValue = Number(value) || 0;
         return (
           <div className="text-xs text-gray-900">{numValue.toLocaleString()}</div>
         );
       }
     },
     {
       key: 'bets',
       label: 'BETS',
       sortable: true,
       render: (value: unknown) => {
         const numValue = Number(value) || 0;
         return (
           <div className="text-xs text-gray-900">Br. {numValue.toLocaleString()}</div>
         );
       }
     },
     {
       key: 'unclaimed',
       label: 'UNCLAIMED',
       sortable: true,
       render: (value: unknown) => {
         const numValue = Number(value) || 0;
         return (
           <div className="text-xs text-gray-900">Br. {numValue.toLocaleString()}</div>
         );
       }
     },
           {
        key: 'unclaimedCount',
        label: 'UNCLAIMED COUNT',
        sortable: true,
        render: (value: unknown) => {
          const numValue = Number(value) || 0;
          return (
            <div className="text-xs text-gray-900">{numValue.toLocaleString()}</div>
          );
        }
      },
           {
        key: 'redeemed',
        label: 'REDEEMED',
        sortable: true,
        render: (value: unknown) => {
          const numValue = Number(value) || 0;
          return (
            <div className="text-xs text-gray-900">Br. {numValue.toLocaleString()}</div>
          );
        }
      },
           {
        key: 'redeemCount',
        label: 'REDEEM COUNT',
        sortable: true,
        render: (value: unknown) => {
          const numValue = Number(value) || 0;
          return (
            <div className="text-xs text-gray-900">{numValue.toLocaleString()}</div>
          );
        }
      },
           {
        key: 'ggr',
        label: 'GGR',
        sortable: true,
        render: (value: unknown) => {
          const numValue = Number(value) || 0;
          return (
            <div className={`text-xs font-medium px-2 py-1 rounded-lg border-2 ${
              numValue >= 0 
                ? 'text-green-700 bg-green-50 border-green-200' 
                : 'text-red-700 bg-red-50 border-red-200'
            }`}>
              Br. {numValue.toLocaleString()}
            </div>
          );
        }
      },
           {
        key: 'netBalance',
        label: 'NET BALANCE',
        sortable: true,
        render: (value: unknown) => {
          const numValue = Number(value) || 0;
          return (
            <div className={`text-xs font-medium px-2 py-1 rounded-lg border-2 ${
              numValue >= 0 
                ? 'text-green-700 bg-green-50 border-green-200' 
                : 'text-red-700 bg-red-50 border-red-200'
            }`}>
              Br. {numValue.toLocaleString()}
            </div>
          );
        }
      }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-600">Retail Report</h1>
        </div> 
      </div>

      {/* Filters and Refresh - Minimized and on same line */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          {/* Date Range Picker */}
          <div className="w-80">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter
            </label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select date range"
              className="[&_button]:text-sm [&_button]:py-1.5"
            />
          </div>
          
          {/* Refresh Button */}
          <div className="flex">
            <button
              onClick={fetchShopData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Show only when data is loaded */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Balance Card */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-300 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-green-700 text-sm font-medium uppercase mb-2">Net Balance</span>
                <span className="text-green-800 text-xl font-bold">Br. {paginatedData[0]?.netBalance?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tickets Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-gray-600 text-sm font-medium uppercase mb-2">Tickets</span>
                <span className="text-gray-800 text-xl font-bold">{paginatedData[0]?.tickets?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Gross Stake Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-gray-600 text-sm font-medium uppercase mb-2">Gross Stake</span>
                <span className="text-gray-800 text-xl font-bold">Br. {paginatedData[0]?.bets?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Claimed Winning Card */}
          <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-gray-600 text-sm font-medium uppercase mb-2">Claimed Winning</span>
                <span className="text-gray-800 text-xl font-bold">Br. {paginatedData[0]?.redeemed?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-gray-100 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table - Show immediately when data is loaded */}
      {data.length > 0 ? (
        <>
          <DataTable<ShopReportData>
            columns={columns}
            data={paginatedData}
            isLoading={isLoading}
            emptyMessage="No data available to display"
            sortable={true}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />
          
          {/* Pagination Controls */}
          {data.length > 0 && (
            <div className="p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">
                  Page {currentPage}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Shop Selection Dropdown - Only show when multiple shops */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Shop:</label>
                      <CustomDropdown
                        options={data.map((shop, index) => ({
                          value: index,
                          label: shop.shopName
                        }))}
                        value={currentPage - 1}
                        onChange={(value) => goToPage(value + 1)}
                        placeholder="Select shop..."
                      />
                    </div>
                  )}
                  
                  {/* Navigation buttons - Only show when multiple pages */}
                  {totalPages > 1 && (
                    <>
                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="">
          
        </div>
      )}
    </div>
  );
}
