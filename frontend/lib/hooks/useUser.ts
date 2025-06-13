// lib/hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, clearTokens } from '@/lib/utils/user-api'; // Use the getCurrentUser from your user-api.ts
import { UserResponse } from '@/lib/user'; // Assuming this is your User type from '@/lib/user'

interface UseUserResult {
  user: UserResponse | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refetchUser: () => Promise<void>; // Added refetchUser
  logout: () => void; // Added logout
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use useCallback to memoize the fetch logic, preventing unnecessary re-creations
  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      // getCurrentUser should internally check for the access token
      // and handle 401/403 by clearing tokens and returning null or throwing specific error
      const userData = await getCurrentUser();

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // If getCurrentUser returns null or throws an error indicating no token
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error("Failed to fetch user:", err);
      // It's important that getCurrentUser handles token clearing on 401/403
      // If it doesn't, you might need to check the error message here.
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message || 'Failed to load user profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies, so this function is stable across renders

  // Initial fetch on component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Dependency array now includes fetchUserData

  // Function to manually trigger re-fetch (e.g., after login)
  const refetchUser = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Function to handle logout
  const logout = useCallback(() => {
    clearTokens(); // Clear tokens from localStorage
    setUser(null);
    setIsAuthenticated(false);
    setError(null); // Clear any errors
    // Optionally redirect, but typically this hook only manages state.
    // The component consuming this hook would handle redirection.
    // For example: router.push('/login');
  }, []);


  return { user, isLoading, error, isAuthenticated, refetchUser, logout };
}