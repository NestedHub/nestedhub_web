// lib/hooks/useWishlist.ts

import { useState, useEffect, useCallback } from "react";
import {
  getUserWishlist,
  addPropertyToWishlist,
  removePropertyFromWishlist,
  clearWishlist,
} from "@/lib/utils/wishlist-api"; // This is where the actual API calls are made
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
  console.log("useWishlist: Hook initialized."); // Log 1

  const [wishlist, setWishlist] = useState<WishListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { isAuthenticated, isLoading: isUserLoading } = useUser();
  console.log(`useWishlist: User status - isAuthenticated: ${isAuthenticated}, isUserLoading: ${isUserLoading}`); // Log 2

  const fetchWishlistData = useCallback(async () => {
    console.log("useWishlist: fetchWishlistData called."); // Log 3
    console.log(`useWishlist: Current user status inside fetchWishlistData - isUserLoading: ${isUserLoading}, isAuthenticated: ${isAuthenticated}`); // Log 4

    if (isUserLoading) {
      console.log("useWishlist: User is still loading, waiting for authentication status."); // Log 5
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated) {
      console.log("useWishlist: User is NOT authenticated. Clearing wishlist state."); // Log 6
      setIsLoading(false);
      setWishlist([]);
      setError(null);
      return;
    }

    // If isAuthenticated is true, proceed to fetch
    console.log("useWishlist: User is authenticated. Attempting to fetch wishlist from API."); // Log 7
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserWishlist(); // <-- This is the call that might throw the error
      console.log("useWishlist: Successfully received wishlist data:", data); // Log 8
      setWishlist(data ?? []);
    } catch (err: any) {
      console.error("useWishlist: Failed to fetch wishlist in fetchWishlistData (catch block). Error object:", err); // Log 9
      console.error("useWishlist: Error message:", err.message); // Log 10 (Important for "API base URL...")

      if (err.message.includes("Authentication required") || err.message.includes("Unauthorized")) {
        console.log("useWishlist: Caught authentication-related error. Setting error to null and clearing wishlist."); // Log 11
        setError(null); // Don't show an error if it's just due to being logged out
        setWishlist([]); // Clear wishlist if session expired
      } else {
        console.log("useWishlist: Caught generic API error. Setting error state."); // Log 12
        setError(err.message || "An unknown error occurred while fetching wishlist.");
        setWishlist([]);
      }
    } finally {
      setIsLoading(false);
      console.log("useWishlist: fetchWishlistData finished. isLoading set to false."); // Log 13
    }
  }, [isAuthenticated, isUserLoading]); // Depend on isAuthenticated and isUserLoading

  // Effect to fetch wishlist on mount or when refetchTrigger or auth status changes
  useEffect(() => {
    console.log(`useWishlist: useEffect triggered. refetchTrigger: ${refetchTrigger}. Calling fetchWishlistData.`); // Log 14
    fetchWishlistData();
  }, [fetchWishlistData, refetchTrigger]);

  // Function to manually refetch
  const refetchWishlist = useCallback(() => {
    console.log("useWishlist: refetchWishlist called. Incrementing refetchTrigger."); // Log 15
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  // Action: Add property
  const addProperty = useCallback(
    async (propertyId: number) => {
      console.log(`useWishlist: addProperty called for propertyId: ${propertyId}`); // Log 16
      if (!isAuthenticated) {
        console.warn("useWishlist: Attempted to add property without authentication."); // Log 17
        setError("You must be logged in to add items to your wishlist.");
        return;
      }
      setError(null);
      try {
        const addedItem = await addPropertyToWishlist(propertyId);
        console.log("useWishlist: addPropertyToWishlist successful. Added item:", addedItem); // Log 18
        if (addedItem) {
          setWishlist((prev) => [...prev, addedItem]);
        }
      } catch (err: any) {
        console.error("useWishlist: Failed to add property to wishlist (catch block). Error:", err); // Log 19
        setError(err.message || "Failed to add property to wishlist.");
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Action: Remove property
  const removeProperty = useCallback(
    async (propertyId: number) => {
      console.log(`useWishlist: removeProperty called for propertyId: ${propertyId}`); // Log 20
      if (!isAuthenticated) {
        console.warn("useWishlist: Attempted to remove property without authentication."); // Log 21
        setError("You must be logged in to remove items from your wishlist.");
        return;
      }
      setError(null);
      try {
        await removePropertyFromWishlist(propertyId);
        console.log("useWishlist: removePropertyFromWishlist successful."); // Log 22
        setWishlist((prev) => prev.filter((item) => item.property_id !== propertyId));
      } catch (err: any) {
        console.error("useWishlist: Failed to remove property from wishlist (catch block). Error:", err); // Log 23
        setError(err.message || "Failed to remove property from wishlist.");
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Action: Clear all wishlist
  const clearAllWishlist = useCallback(
    async () => {
      console.log("useWishlist: clearAllWishlist called."); // Log 24
      if (!isAuthenticated) {
        console.warn("useWishlist: Attempted to clear wishlist without authentication."); // Log 25
        setError("You must be logged in to clear your wishlist.");
        return;
      }
      setError(null);
      try {
        await clearWishlist();
        console.log("useWishlist: clearWishlist successful."); // Log 26
        setWishlist([]);
      } catch (err: any) {
        console.error("useWishlist: Failed to clear wishlist (catch block). Error:", err); // Log 27
        setError(err.message || "Failed to clear wishlist.");
        throw err;
      }
    },
    [isAuthenticated]
  );

  console.log(`useWishlist: Returning state - isLoading: ${isLoading}, error: ${error}, wishlist count: ${wishlist?.length ?? 0}`); // Log 28

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