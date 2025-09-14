// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication Types
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

// Shop Owner Types
export interface ShopOwner {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Shop Types
export interface Shop {
  _id: string;
  name: string;
  location: string;
  margin: number;
  status: 'active' | 'inactive' | 'pending';
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
}

// Cashier Types
export interface Cashier {
  _id: string;
  fullName: string;
  username: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
