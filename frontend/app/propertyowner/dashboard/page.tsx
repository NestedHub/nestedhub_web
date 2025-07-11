'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, Home } from 'lucide-react';
import Sidebar from '@/component/dashoboadpropertyowner/sidebar';
import Card from '@/component/dashoboadpropertyowner/card';
import { propertyApi } from '@/lib/api/property';

interface PropertyOwnerStats {
  totalProperties: number;
  activeProperties: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PropertyOwnerStats>({
    totalProperties: 0,
    activeProperties: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch property stats for the current owner
        const statsData = await propertyApi.getOwnerStats();
        setStats({
          totalProperties: statsData.total_owned || 0,
          activeProperties: statsData.total_rented || 0, // You may want to use a different field if available
        });
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
      <Sidebar>
        <div className="p-6">
          <div className="text-red-600">{error}</div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back to your dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            title="Total Properties" 
            value={isLoading ? '...' : stats.totalProperties.toString()} 
            icon={<LayoutGrid className="h-6 w-6 text-green-600" />} 
          />
          <Card 
            title="Active Properties" 
            value={isLoading ? '...' : stats.activeProperties.toString()} 
            icon={<Home className="h-6 w-6 text-green-600" />} 
          />
        </div>
      </div>
    </Sidebar>
  );
}
