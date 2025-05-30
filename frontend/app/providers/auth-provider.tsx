'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { setAuthCookie, removeAuthCookie, getAuthCookie } from '../utils/cookie';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: 'user' | 'propertyowner' | 'admin';
  } | null;
  token: string | null;
}

interface AuthContextType {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  clearAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthStateInternal] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  // Initialize auth state from cookie on mount
  useEffect(() => {
    const cookieAuth = getAuthCookie();
    if (!cookieAuth) return;

    try {
      const parsedAuth = JSON.parse(cookieAuth);
      if (parsedAuth.user && parsedAuth.token) {
        setAuthStateInternal({
          isAuthenticated: true,
          user: parsedAuth.user,
          token: parsedAuth.token,
        });
      }
    } catch (error) {
      console.error('Error parsing auth cookie:', error);
      removeAuthCookie();
    }
  }, []);

  useEffect(() => {
    const token = getAuthCookie();
    if (token) {
      setAuthStateInternal(prev => ({
        ...prev,
        isAuthenticated: true,
        token,
      }));
    }
  }, []);

  // Update auth cookie when auth state changes
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user || !authState.token) {
      removeAuthCookie();
      return;
    }

    const authData = {
      user: authState.user,
      token: authState.token,
    };

    try {
      setAuthCookie(authData);
    } catch (error) {
      console.error('Error setting auth cookie:', error);
      removeAuthCookie();
    }
  }, [authState]);

  const setAuthState = (state: AuthState) => {
    setAuthStateInternal(state);
  };

  const clearAuthState = () => {
    removeAuthCookie();
    setAuthStateInternal({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthState, clearAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
