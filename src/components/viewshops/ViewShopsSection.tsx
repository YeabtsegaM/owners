'use client';

import React, { useState, useEffect } from 'react';

import { apiClient } from '@/utils/api';
import { Shop } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface ShopWithStats extends Shop, Record<string, unknown> {
  totalCashiers: number;
  totalRevenue: number;
  activeGames: number;
  shopName: string;
}

export default function ViewShopsSection() {
  const { user } = useAuth();

  const [shops, setShops] = useState<ShopWithStats[]>([]);
  const [filteredShops, setFilteredShops] = useState<ShopWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedShopId, setSelectedShopId] = useState<string>('');

  useEffect(() => {
    // Load shops immediately when component mounts
    fetchShops();
  }, []);
  
  // Also load shops when user becomes available
  useEffect(() => {
    if (user) {
      fetchShops();
    }
  }, [user]);

  useEffect(() => {
    filterShops();
  }, [shops, searchTerm, statusFilter, selectedShopId]);

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getShops();
      console.log('Raw API response:', response);
      
      if (response.success && response.data) {
        const shopsData = response.data as ShopWithStats[];
        console.log('Shops data:', shopsData);
        
        // Filter to show only shops owned by current user
        const userShops = shopsData.filter(shop => {
          // Check if current user is the owner of this shop
          const _isOwner = shop.ownerId === user?.id ||
                         shop.ownerName === user?.username ||
                         shop.ownerUsername === user?.username ||
                         (shop.owner && typeof shop.owner === 'object' && 'username' in shop.owner && (shop.owner as { username: string }).username === user?.username);
          
          // Additional strict check - ensure the shop owner matches exactly
          const shopOwnerUsername = shop.ownerUsername || shop.ownerName || 
            (shop.owner && typeof shop.owner === 'object' && 'username' in shop.owner ? (shop.owner as { username: string }).username : null);
          
          const exactMatch = shopOwnerUsername === user?.username;
          
          console.log(`Shop ${shop.shopName || shop.name}: owner=${shopOwnerUsername}, currentUser=${user?.username}, exactMatch=${exactMatch}`);
          return exactMatch;
        });
        
        console.log('Filtered user shops:', userShops);
        setShops(userShops);
      } else {
        setShops([]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterShops = () => {
    let filtered = shops;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(shop => {
        const shopName = (shop.name || shop.shopName);
        const location = (shop.location);
        
        // Safely extract owner information with proper type checking
        let ownerName = '';
        let ownerUsername = '';
        
        if (shop.ownerName) {
          ownerName = String(shop.ownerName);
        } else if (shop.owner && typeof shop.owner === 'object' && 'fullName' in shop.owner) {
          ownerName = String((shop.owner as { fullName?: string }).fullName || '');
        }
        
        if (shop.ownerUsername) {
          ownerUsername = String(shop.ownerUsername);
        } else if (shop.owner && typeof shop.owner === 'object' && 'username' in shop.owner) {
          ownerUsername = String((shop.owner as { username?: string }).username || '');
        }
        
        // Ensure strings before calling toLowerCase() - use explicit type assertion
        const _safeOwnerName = (ownerName || '') as string;
        const _safeOwnerUsername = (ownerUsername || '') as string;
        
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shop => shop.status === statusFilter);
    }

    // Apply shop selection filter
    if (selectedShopId) {
      filtered = filtered.filter(shop => shop._id === selectedShopId);
    }

    setFilteredShops(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-red-200'
    };

    return (
      <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
    
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-600">View Shop Info</h1>
        </div> 
      </div>
      {/* Minimalist Account Header */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Profile Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold text-white">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-green-800">{user?.fullName || 'Owner Name'}</h3>
                <p className="text-sm text-green-600">@{user?.username || 'Username'}</p>
              </div>
            </div>
            
            {/* Right - Role Badge */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-sm font-medium">Owner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
        <div className="p-4">
          {/* Table with overflow handling */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500">{searchTerm ? "No shops found" : "No shops yet"}</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SHOP NAME</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOCATION</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShops.map((shop, index) => (
                    <tr key={shop._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-500">{index + 1}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-green-600">
                              {(shop.shopName || shop.name || 'S').charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-900">{shop.shopName || shop.name}</div>
                            <div className="text-xs text-gray-500">Created {new Date(shop.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-900">{shop.location || 'N/A'}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {getStatusBadge(shop.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
