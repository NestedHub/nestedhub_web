// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Home, User } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/component/admin/sidebar";
import StatCard from "@/component/admin/card";
// Assuming getAuthHeaders is still needed and available
// If getAuthHeaders is part of your user-api.ts and relies on localStorage
// then it should be fine.
import { getAuthHeaders } from "@/lib/api/auth";
import { useAuthContext } from "@/lib/context/AuthContext"; // <-- CORRECTED IMPORT

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalPropertyOwners: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  // Use useAuthContext instead of useAuth
  const { isAuthenticated, user, isLoading: authLoading } = useAuthContext(); // <-- CORRECTED HOOK CALL
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalPropertyOwners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    // Only attempt to fetch if authentication is loaded, user is authenticated,
    // user object exists, and user role is admin.
    if (authLoading || !isAuthenticated || !user || user.role !== "admin") {
      // If authLoading is true, it means the auth state is still being determined.
      // If not authenticated or not an admin, we should redirect.
      // This 'return' here prevents the fetch if conditions aren't met,
      // and the useEffect below will handle the redirection.
      return;
    }

    try {
      // Ensure NEXT_PUBLIC_API_URL is correctly set in your .env file
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers = getAuthHeaders(); // This should be able to get tokens from localStorage via user-api.ts

      const response = await fetch(`${apiUrl}/api/admin/dashboard/stats`, {
        method: "GET",
        // credentials: 'include' is generally used for sending cookies,
        // if your auth is token-based via Headers (Bearer token), this might not be strictly necessary
        // but often harmless. Keep it if your backend uses sessions/cookies too.
        credentials: "include",
        headers: headers,
        cache: "no-store", // Disable caching to ensure fresh data
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // If unauthenticated or unauthorized, redirect to admin login
          router.replace("/admin/login");
          return; // Stop execution after redirect
        }

        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Failed to load dashboard statistics. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, isAuthenticated, user, authLoading]); // Dependencies for useCallback

  useEffect(() => {
    // When auth state changes, or fetchStats function (due to its dependencies) changes,
    // re-run fetchStats.
    // Also, handle redirection if not authenticated or not admin after authLoading is false.
    if (!authLoading) {
      // Ensure auth state has been determined
      if (!isAuthenticated || user?.role !== "admin") {
        router.replace("/admin/login");
        return; // Prevent fetching if user is not authorized
      }
      fetchStats();
    }
  }, [authLoading, isAuthenticated, user, fetchStats, router]);

  // Show loading state while checking authentication or fetching stats
  if (authLoading || isLoading) {
    return (
      <AdminSidebar>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800"></div>
          <p className="ml-4 text-lg text-gray-700">Loading dashboard...</p>
        </div>
      </AdminSidebar>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminSidebar>
        <div className="p-6">
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-md text-gray-600">
            Welcome back,{" "}
            <span className="font-semibold">{user?.name || "Admin"}</span>!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Customers"
            value={stats.totalUsers.toString()}
            icon={<Users className="h-8 w-8 text-blue-600" />}
          />
          <StatCard
            title="Total Properties"
            value={stats.totalProperties.toString()}
            icon={<Home className="h-8 w-8 text-green-600" />}
          />
          <StatCard
            title="Total Property Owners"
            value={stats.totalPropertyOwners.toString()}
            icon={<User className="h-8 w-8 text-purple-600" />}
          />
        </div>
      </div>
    </AdminSidebar>
  );
}
