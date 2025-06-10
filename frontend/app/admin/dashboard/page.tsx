"use client"

import { useEffect, useState } from 'react';
import { Users, Home, User } from "lucide-react"
import AdminSidebar from "@/component/admin/sidebar"
import StatCard from "@/component/admin/card"

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalPropertyOwners: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalPropertyOwners: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/dashboard/stats`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <AdminSidebar>
        <div className="text-red-600">{error}</div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back, Admin</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={isLoading ? '...' : stats.totalUsers.toString()} 
            icon={<Users className="h-6 w-6 text-teal-600" />} 
          />
          <StatCard 
            title="Total Properties" 
            value={isLoading ? '...' : stats.totalProperties.toString()} 
            icon={<Home className="h-6 w-6 text-teal-600" />} 
          />
          <StatCard 
            title="Total Property Owners" 
            value={isLoading ? '...' : stats.totalPropertyOwners.toString()} 
            icon={<User className="h-6 w-6 text-teal-600" />} 
          />
        </div>
      </div>
    </AdminSidebar>
  )
}
