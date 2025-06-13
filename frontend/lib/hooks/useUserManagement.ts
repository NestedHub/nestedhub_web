// lib/hooks/useUserManagement.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  searchUsers,
  listUsers,
  approveUser,
  rejectPropertyOwner,
  banUnbanUser,
  deleteUser,
  getPendingApprovals,
} from "@/lib/utils/user-api"; // Adjust path
import {
  UserResponse,
  SearchUsersParams,
  ListUsersParams,
  SuccessMessageResponse,
} from "@/lib/user"; // Adjust path
import { useAuth } from "./useAuth"; // To check user role

interface UserManagementState {
  users: UserResponse[];
  pendingApprovals: UserResponse[];
  isLoading: boolean;
  error: string | null;
  search: (params: SearchUsersParams) => Promise<UserResponse[]>;
  list: (params?: ListUsersParams) => Promise<UserResponse[]>;
  approve: (userId: number) => Promise<UserResponse>;
  reject: (userId: number) => Promise<string>;
  ban: (userId: number) => Promise<UserResponse>;
  unban: (userId: number) => Promise<UserResponse>;
  remove: (userId: number, hardDelete?: boolean) => Promise<string>;
  fetchPendingApprovals: () => Promise<UserResponse[]>;
  refetchAllUsers: () => void; // A generic refetch for user lists
}

export function useUserManagement(): UserManagementState {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0); // For general refetching

  const isAdmin = authUser?.role === "admin";

  const fetchUsers = useCallback(async (params?: ListUsersParams) => {
    if (!isAdmin) {
      setError("Permission denied: Only administrators can list users.");
      setUsers([]);
      setIsLoading(false);
      return [];
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await listUsers(params);
      setUsers(data);
      return data;
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load user list.");
      setUsers([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const fetchPending = useCallback(async () => {
    if (!isAdmin) {
      setPendingApprovals([]);
      return [];
    }
    try {
      const data = await getPendingApprovals();
      setPendingApprovals(data);
      return data;
    } catch (err: any) {
      console.error("Failed to fetch pending approvals:", err);
      // Don't set global error for this, it's a specific list
      throw err;
    }
  }, [isAdmin]);

  // Initial fetch for all users and pending approvals
  useEffect(() => {
    if (!authLoading) { // Only fetch if auth status is known
      fetchUsers();
      fetchPending();
    }
  }, [fetchUsers, fetchPending, refetchTrigger, authLoading]);

  // --- Admin Actions ---

  const handleSearch = useCallback(async (params: SearchUsersParams): Promise<UserResponse[]> => {
    if (!isAdmin) {
      setError("Permission denied: Only administrators can search users.");
      throw new Error("Permission denied.");
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchUsers(params);
      setUsers(data); // Update main users list with search results
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to search users.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const handleApprove = useCallback(async (userId: number): Promise<UserResponse> => {
    if (!isAdmin) throw new Error("Permission denied: Only administrators can approve users.");
    try {
      const approvedUser = await approveUser(userId);
      setRefetchTrigger(prev => prev + 1); // Trigger refetch of lists
      return approvedUser;
    } catch (err: any) {
      setError(err.message || `Failed to approve user ${userId}.`);
      throw err;
    }
  }, [isAdmin]);

  const handleReject = useCallback(async (userId: number): Promise<string> => {
    if (!isAdmin) throw new Error("Permission denied: Only administrators can reject users.");
    try {
      const response: SuccessMessageResponse = await rejectPropertyOwner(userId);
      setRefetchTrigger(prev => prev + 1); // Trigger refetch of lists
      return response.message;
    } catch (err: any) {
      setError(err.message || `Failed to reject user ${userId}.`);
      throw err;
    }
  }, [isAdmin]);

  const handleBan = useCallback(async (userId: number): Promise<UserResponse> => {
    if (!isAdmin) throw new Error("Permission denied: Only administrators can ban users.");
    try {
      const updatedUser = await banUnbanUser(userId, true);
      setRefetchTrigger(prev => prev + 1);
      return updatedUser;
    } catch (err: any) {
      setError(err.message || `Failed to ban user ${userId}.`);
      throw err;
    }
  }, [isAdmin]);

  const handleUnban = useCallback(async (userId: number): Promise<UserResponse> => {
    if (!isAdmin) throw new Error("Permission denied: Only administrators can unban users.");
    try {
      const updatedUser = await banUnbanUser(userId, false);
      setRefetchTrigger(prev => prev + 1);
      return updatedUser;
    } catch (err: any) {
      setError(err.message || `Failed to unban user ${userId}.`);
      throw err;
    }
  }, [isAdmin]);

  const handleRemove = useCallback(async (userId: number, hardDelete: boolean = false): Promise<string> => {
    if (!isAdmin) throw new Error("Permission denied: Only administrators can delete users.");
    try {
      const response: SuccessMessageResponse = await deleteUser(userId, hardDelete);
      setRefetchTrigger(prev => prev + 1);
      return response.message;
    } catch (err: any) {
      setError(err.message || `Failed to delete user ${userId}.`);
      throw err;
    }
  }, [isAdmin]);

  const refetchAllUsers = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    users,
    pendingApprovals,
    isLoading,
    error,
    search: handleSearch,
    list: fetchUsers,
    approve: handleApprove,
    reject: handleReject,
    ban: handleBan,
    unban: handleUnban,
    remove: handleRemove,
    fetchPendingApprovals: fetchPending,
    refetchAllUsers,
  };
}