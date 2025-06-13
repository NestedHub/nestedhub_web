// lib/hooks/useWishlist.ts

import { useState, useEffect, useCallback } from "react";
import {
  getUserWishlist,
  addPropertyToWishlist,
  removePropertyFromWishlist,
  clearWishlist,
} from "@/lib/utils/wishlist-api";
import { WishListResponse } from "@/lib/types";
import { useUser } from "./useUser"; // Import your useUser hook

interface UseWishlistResult {
  wishlist: WishListResponse[];
  isLoading: boolean;
  error: string | null;
  addProperty: (propertyId: number) => Promise<void>;
  removeProperty: (propertyId: number) => Promise<void>;
  clearAllWishlist: () => Promise<void>;
  refetchWishlist: () => void;
}

export function useWishlist(): UseWishlistResult {
  const [wishlist, setWishlist] = useState<WishListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // --- Crucial Change: Get authentication status from useUser ---
  const { isAuthenticated, isLoading: isUserLoading } = useUser();

  // Function to fetch wishlist data
  const fetchWishlistData = useCallback(async () => {
    // Only proceed if user authentication status has been determined
    // AND user is authenticated.
    // If user is still loading, wait for the next cycle.
    if (isUserLoading) {
      setIsLoading(true); // Keep loading if user auth is still unknown
      return;
    }

    if (!isAuthenticated) {
      // User is not authenticated, so clear wishlist and stop loading
      setIsLoading(false);
      setWishlist([]);
      setError(null); // No token is not an "error" for unauthenticated users, it's expected
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserWishlist();
      setWishlist(data ?? []);
    } catch (err: any) {
      console.error("Failed to fetch wishlist:", err);
      // If the error is due to authentication, it means the token might have expired.
      // useUser should handle clearing the token in localStorage.
      if (err.message.includes("Authentication required") || err.message.includes("Unauthorized")) {
        setError(null); // Don't show an error if it's just due to being logged out
        setWishlist([]); // Clear wishlist if session expired
      } else {
        setError(err.message || "An unknown error occurred while fetching wishlist.");
        setWishlist([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isUserLoading]); // Depend on isAuthenticated and isUserLoading

  // Effect to fetch wishlist on mount or when refetchTrigger or auth status changes
  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData, refetchTrigger]);

  // Function to manually refetch
  const refetchWishlist = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  // Action: Add property
  const addProperty = useCallback(
    async (propertyId: number) => {
      if (!isAuthenticated) {
        setError("You must be logged in to add items to your wishlist.");
        return; // Prevent API call if not authenticated
      }
      setError(null);
      try {
        const addedItem = await addPropertyToWishlist(propertyId);
        if (addedItem) {
          setWishlist((prev) => [...prev, addedItem]);
        }
        // Consider calling refetchWishlist() here for stricter consistency
        // refetchWishlist();
      } catch (err: any) {
        console.error("Failed to add property to wishlist:", err);
        setError(err.message || "Failed to add property to wishlist.");
        throw err;
      }
    },
    [isAuthenticated] // Dependency on isAuthenticated
  );

  // Action: Remove property
  const removeProperty = useCallback(
    async (propertyId: number) => {
      if (!isAuthenticated) {
        setError("You must be logged in to remove items from your wishlist.");
        return; // Prevent API call if not authenticated
      }
      setError(null);
      try {
        await removePropertyFromWishlist(propertyId);
        setWishlist((prev) => prev.filter((item) => item.property_id !== propertyId));
        // Consider calling refetchWishlist() here for stricter consistency
        // refetchWishlist();
      } catch (err: any) {
        console.error("Failed to remove property from wishlist:", err);
        setError(err.message || "Failed to remove property from wishlist.");
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Action: Clear all wishlist
  const clearAllWishlist = useCallback(
    async () => {
      if (!isAuthenticated) {
        setError("You must be logged in to clear your wishlist.");
        return; // Prevent API call if not authenticated
      }
      setError(null);
      try {
        await clearWishlist();
        setWishlist([]);
        // Consider calling refetchWishlist() here for stricter consistency
        // refetchWishlist();
      } catch (err: any) {
        console.error("Failed to clear wishlist:", err);
        setError(err.message || "Failed to clear wishlist.");
        throw err;
      }
    },
    [isAuthenticated]
  );

  return {
    wishlist,
    isLoading,
    error,
    addProperty,
    removeProperty,
    clearAllWishlist,
    refetchWishlist,
  };
}