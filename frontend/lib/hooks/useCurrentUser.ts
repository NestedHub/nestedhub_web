// lib/hooks/useCurrentUser.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentUser, updateUser } from "@/lib/utils/user-api"; // Adjust path
import { UserResponse, UserUpdate } from "@/lib/user"; // Adjust path
import { useAuth } from "./useAuth"; // To potentially re-fetch if tokens change or user state is critical

interface CurrentUserState {
  currentUser: UserResponse | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (userData: UserUpdate) => Promise<UserResponse>;
  refetchCurrentUser: () => void;
}

export function useCurrentUser(): CurrentUserState {
  const { isAuthenticated, user: authUser, refreshUser: refreshAuthUser } = useAuth(); // Get user from auth hook
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(authUser); // Initialize with user from auth hook
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0); // To manually trigger refetch

  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setCurrentUser(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCurrentUser();
      setCurrentUser(data);
    } catch (err: any) {
      console.error("Failed to fetch current user data:", err);
      setError(err.message || "Failed to load user profile.");
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData, refetchTrigger, authUser]); // Refetch when authUser changes or manually triggered

  const updateProfile = useCallback(async (userData: UserUpdate): Promise<UserResponse> => {
    if (!currentUser) {
      throw new Error("No current user to update. Please log in.");
    }
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser(currentUser.user_id, userData);
      setCurrentUser(updatedUser);
      refreshAuthUser(); // Update the user state in the useAuth hook as well
      return updatedUser;
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
      throw err; // Re-throw for component to handle
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, refreshAuthUser]);

  const refetchCurrentUser = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    currentUser,
    isLoading,
    error,
    updateProfile,
    refetchCurrentUser,
  };
}