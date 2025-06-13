// lib/context/AuthContext.tsx (Example)
"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserResponse } from '@/lib/user';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: ReturnType<typeof useAuth>['login'];
  register: ReturnType<typeof useAuth>['register'];
  googleLoginRedirect: ReturnType<typeof useAuth>['googleLoginRedirect'];
  handleGoogleCallback: ReturnType<typeof useAuth>['handleGoogleCallback'];
  logout: ReturnType<typeof useAuth>['logout'];
  verifyEmail: ReturnType<typeof useAuth>['verifyEmail'];
  requestPasswordReset: ReturnType<typeof useAuth>['requestPasswordReset'];
  confirmPasswordReset: ReturnType<typeof useAuth>['confirmPasswordReset'];
  refreshUser: ReturnType<typeof useAuth>['refreshUser'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth(); // All the state and actions from useAuth

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}