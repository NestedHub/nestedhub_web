"use client";

import { useEffect, useState, useCallback } from 'react';
import { Users, Home, User } from "lucide-react"
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/component/admin/sidebar"
import StatCard from "@/component/admin/card"
import { getAuthHeaders } from '@/lib/api/auth';
import { useAuth } from '@/app/providers/AuthProvider';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalPropertyOwners: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalPropertyOwners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    if (authLoading || !isAuthenticated || !user || user.role !== 'admin') {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers = getAuthHeaders();

      const response = await fetch(`${apiUrl}/api/admin/dashboard/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: headers,
        cache: 'no-store', // Disable caching to ensure fresh data
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/admin/login');
          return;
        }

        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load dashboard statistics. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, isAuthenticated, user, authLoading]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Show loading state while checking authentication
  if (authLoading || isLoading) {
    return (
      <AdminSidebar>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-800"></div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminSidebar>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Admin'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Customers" 
            value={stats.totalUsers.toString()} 
            icon={<Users className="h-6 w-6 text-teal-600" />} 
          />
          <StatCard 
            title="Total Properties" 
            value={stats.totalProperties.toString()} 
            icon={<Home className="h-6 w-6 text-teal-600" />} 
          />
          <StatCard 
            title="Total Property Owners" 
            value={stats.totalPropertyOwners.toString()} 
            icon={<User className="h-6 w-6 text-teal-600" />} 
          />
        </div>
      </div>
    </AdminSidebar>
  );
  );
}
