'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable, { Column } from '@/components/ui/DataTable';
import DateRangePicker, { DateRange } from '@/components/ui/DateRangePicker';
import { apiClient } from '@/utils/api';

interface CashierReportData extends Record<string, unknown> {
  _id: string;
  shopName: string;
  cashierName: string;
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
  cashiers?: Array<{
    _id: string;
    name: string;
    username: string;
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
  }>;
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

export default function CashiersReport() {
  const { user } = useAuth();
  const [data, setData] = useState<CashierReportData[]>([]);
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

  const fetchCashierData = async () => {
    try {
      setIsLoading(true);
      
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
        // We'll show only individual cashiers for each shop
        const transformedData: CashierReportData[] = [];
        
        // Fetch real cashier data for each shop
        for (const shop of userShops) {
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
                // Process each cashier with real data from the balance endpoint
                cashiersData.forEach((cashier: CashierData, index: number) => {
                  
                  // Map the data from the balance endpoint response
                  const unclaimedCount = cashier.unclaimedCount || 0;
                  const redeemCount = cashier.redeemCount || 0;
                  const ggr = (cashier.netBalance || 0) - (cashier.unclaimed || 0);
                  
                  transformedData.push({
                    _id: cashier.cashierId || cashier._id || `cashier-${Date.now()}`,
                    shopName: shopName,
                    cashierName: cashier.cashierName || cashier.fullName || cashier.username || 'Unknown Cashier',
                    tickets: cashier.tickets || 0,
                    bets: cashier.bets || 0,
                    unclaimed: cashier.unclaimed || 0,
                    redeemed: cashier.redeemed || 0,
                    unclaimedCount: unclaimedCount,
                    redeemCount: redeemCount,
                    ggr: ggr,
                    netBalance: cashier.netBalance || 0,
                    lastUpdated: new Date().toISOString(),
                    rowIndex: transformedData.length + 1
                  });
                });
                
                // Only add individual cashiers, no shop totals
              } else {
                // Shop has no cashiers - skip this shop entirely
                continue;
              }
            } else {
              // Fallback: shop has no cashiers - skip this shop entirely
              continue;
            }
          } catch (error) {
            // Error occurred - skip this shop entirely
            console.error('Error fetching cashier data for shop:', shopName, error);
            continue;
          }
        }
        
        setData(transformedData);
      } else {
        // API call succeeded but returned error
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching cashier data:', error);
      // Show empty state for any errors
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to refetch data when date range changes
  React.useEffect(() => {
    if (data.length > 0) {
      fetchCashierData();
    }
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    
    // Sort the data based on the key and direction
    const sortedData = [...data].sort((a, b) => {
      let aValue = a[key as keyof CashierReportData];
      let bValue = b[key as keyof CashierReportData];
      
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
  };





  const columns: Column<CashierReportData>[] = [
         {
       key: 'index',
       label: 'NO.',
       sortable: false,
       render: (value: unknown, row: CashierReportData) => (
         <div className="text-xs text-gray-500">
           {(row as { rowIndex?: number }).rowIndex !== undefined ? (row as { rowIndex?: number }).rowIndex : ''}
         </div>
       )
     },
         {
       key: 'shopName',
       label: 'SHOP',
       sortable: true,
       render: (value: unknown, row: CashierReportData) => (
         <div className="text-xs font-medium text-gray-900">
           {row.shopName || 'Unknown Shop'}
         </div>
       )
     },
         {
       key: 'cashierName',
       label: 'CASHIER',
       sortable: true,
       render: (value: unknown, row: CashierReportData) => (
         <div className="text-xs font-medium text-gray-900">
           {row.cashierName || 'Unknown Cashier'}
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
          <h1 className="text-xl font-bold text-gray-600">Cashiers Report</h1>
        </div>
      </div>

      {/* Filters and Refresh - Minimized and on same line */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
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
              onClick={fetchCashierData}
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

      {/* Data Table - Show immediately when data is loaded */}
      {data.length > 0 ? (
        <>
          <DataTable<CashierReportData>
            columns={columns}
            data={data}
            isLoading={isLoading}
            emptyMessage="No cashiers found for the selected criteria"
            sortable={true}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />
          
          {/* Pagination Info */}
          <div className="p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                Page 1
              </div>
            </div>
          </div>
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
