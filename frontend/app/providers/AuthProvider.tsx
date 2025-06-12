'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'property_owner' | 'admin';
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const authToken = Cookies.get('auth_token');
      const userCookie = Cookies.get('user');

      if (!authToken || !userCookie) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userCookie);
      
      // Validate token format and expiration
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
            await logout();
            return;
          }
        }
      } catch (err) {
        console.error('Error parsing token:', err);
        await logout();
        return;
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error checking auth:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (token: string, userData: User) => {
    try {
      // Store token in localStorage with user data
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        token
      }));

      // Set cookies with proper configuration
      Cookies.set('auth_token', token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      Cookies.set('user', JSON.stringify(userData), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      // Redirect based on role
      const redirectPath = {
        admin: '/admin/dashboard',
        property_owner: '/propertyowner/dashboard',
        customer: '/user'
      }[userData.role] || '/';

      // Use replace instead of push to prevent back button issues
      router.replace(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      Cookies.remove('auth_token');
      Cookies.remove('user');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    isAuthenticated,
    user,
    loading,
    checkAuth,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
