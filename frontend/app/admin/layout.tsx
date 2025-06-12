'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
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

  // If not authenticated or not admin, don't render anything while redirecting
  // But allow rendering the login page
  if ((!isAuthenticated || !user || user.role !== 'admin') && pathname !== '/admin/login') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 