import { API_CONFIG } from '@/lib/constants';
import type { ApiResponse, LoginResponse } from '@/types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('shopOwnerToken');

    // Don't send token for authentication endpoints (but /verify needs the token)
    const isAuthEndpoint = endpoint.includes('/login') || endpoint.includes('/logout');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && !isAuthEndpoint && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Login failed. Please check your username and password.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please contact your administrator.');
        } else if (response.status === 404) {
          throw new Error('Service not found. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(data.error || 'Something went wrong. Please try again.');
        }
      }

      return data;
                } catch (error: unknown) {
        console.error('API request failed:', error);
        
        // Handle network errors more gracefully
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to server. Please check your internet connection and try again.');
        }
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(errorMessage || 'Connection error. Please try again.');
      }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/shop-owner-auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/shop-owner-auth/logout', {
      method: 'POST',
    });
  }

  async verifyToken(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/shop-owner-auth/verify');
  }

  // Shop Owner specific endpoints
  async getShops(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/shops');
  }

  async getShopCashiers(shopId: string, startDate?: string, endDate?: string): Promise<ApiResponse<unknown>> {
    let endpoint = `/api/balance/cashier-details/${shopId}`;
    
    // Add date query parameters if provided
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      endpoint += `?${params.toString()}`;
    }
    
    return this.request<unknown>(endpoint);
  }
}

export const apiClient = new ApiClient();
