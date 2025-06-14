// lib/api/auth.ts

// Import the getAccessToken function from your user-api.ts,
// which is responsible for retrieving the token from localStorage.
import { getAccessToken } from '@/lib/utils/user-api'; 

// REMOVED: import Cookies from 'js-cookie'; // This line is no longer needed here!

interface User {
  id: string;
  email: string;
  role: 'customer' | 'property_owner' | 'admin';
  name: string;
}

/**
 * Returns authentication headers for API requests.
 * It retrieves the access token from localStorage using getAccessToken from user-api.ts.
 * @returns {HeadersInit} An object containing the Authorization header, or an empty object if no token is found.
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken(); // Get token using your user-api utility
  
  // If a token exists, return the Authorization header
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json', // Assuming most authenticated requests send JSON
    };
  }
  
  // If no token, return an empty object or a Content-Type header if needed
  return {
    'Content-Type': 'application/json',
  };
}

// Add other authentication-related utility functions here if they belong.
// Example:
// export function isTokenExpired(token: string): boolean {
//   // Implement token expiration check if needed here, 
//   // but generally, your backend should invalidate and your login/refresh flow handle it.
//   // For client-side, you might parse the JWT.
//   return false; 
// }

// If this file previously held other authentication-related logic
// that directly used cookies, that logic should be moved or adapted
// to either use localStorage (via user-api.ts) or be part of your
// useAuth hook, consistent with your chosen token management strategy.

