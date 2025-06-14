'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/lib/context/AuthContext'; // <-- CORRECTED IMPORT PATH

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading: loading } = useAuthContext(); // Using isLoading from useAuthContext

  useEffect(() => {
    if (!loading) { // Ensure authentication state has been determined
      if (!isAuthenticated || !user || user.role !== 'admin') {
        // Don't redirect if already on the login page
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
        return;
      }

      // If authenticated and on login page, redirect to dashboard
      if (pathname === '/admin/login' && isAuthenticated && user.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, loading, router, pathname]);

  // Show loading state while checking authorization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-800"></div>
      </div>
    );
  }

  // If not authenticated or not admin, and NOT on the login page, return null to prevent content flicker
  if ((!isAuthenticated || !user || user.role !== 'admin') && pathname !== '/admin/login') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}