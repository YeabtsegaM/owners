// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
} as const;

// Shop Owner Routes
export const SHOP_OWNER_ROUTES = {
  LOGIN: '/',
  REPORTS: '/reports',
} as const;

// Currency Configuration
export const CURRENCY = {
  SYMBOL: 'Br.',
  DECIMAL_PLACES: 0,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to access this page',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_TOKEN: 'Invalid or expired session. Please login again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
} as const;
