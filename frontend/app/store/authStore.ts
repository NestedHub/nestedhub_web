'use client';

import { create } from 'zustand';
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

interface AuthActions {
  setAuthState: (state: AuthState) => void;
  clearAuthState: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  setAuthState: (state) => {
    set(state);
    if (state.token) {
      setAuthCookie(state.token);
    }
  },
  clearAuthState: () => {
    removeAuthCookie();
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },
  initialize: () => {
    const token = getAuthCookie();
    if (token) {
      set({
        isAuthenticated: true,
        token,
      });
    }
  },
}));
