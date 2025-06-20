"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserResponse } from '@/lib/user'; // Ensure this type is correct

// Define the shape of your Auth Context
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
  revokeToken: ReturnType<typeof useAuth>['revokeToken']; // Added revokeToken
  refreshUser: ReturnType<typeof useAuth>['refreshUser']; // Corrected to refreshUser
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth(); // All the state and actions from useAuth

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the Auth Context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
