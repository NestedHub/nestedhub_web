// lib/hooks/useAuth.ts
// Updated: June 21, 2025

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  registerUser,
  googleLogin,
  // Removed: googleCallback, // This is no longer imported
  verifyEmail,
  requestPasswordReset,
  confirmPasswordReset,
  revokeToken,
  getCurrentUser,
  setTokens, // Keep this - it's crucial for storing tokens
  clearTokens,
  getAccessToken,
} from "@/lib/utils/user-api";
import {
  UserCreate,
  TokenResponse,
  UserResponse,
  VerifyEmailRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  TokenRevokeRequest,
  GoogleAuthUrlResponse,
} from "@/lib/user";

interface UseAuthResult {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserResponse>;
  register: (userData: UserCreate) => Promise<UserResponse>;
  googleLoginRedirect: () => Promise<void>;
  handleGoogleCallback: (code: string) => Promise<UserResponse>; // Remains for type compatibility, but internal logic changes
  logout: () => Promise<void>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<UserResponse>;
  requestPasswordReset: (data: PasswordResetRequest) => Promise<string>;
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<string>;
  revokeToken: (data: TokenRevokeRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
  // Explicitly exposed for GoogleCallbackContent
  setTokens: (access_token: string, refresh_token: string) => void;
  fetchCurrentUser: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Core User Data Fetching and State Management ---
  const fetchCurrentUser = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch current user:", err);
      // Only clear tokens if the error genuinely means the token is bad/expired
      if (err.message === "Unauthorized" || err.message.includes("Token expired")) {
        clearTokens();
      }
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message || "Failed to load user data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // --- Authentication Actions ---

  const login = useCallback(
    async (email: string, password: string): Promise<UserResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const tokenResponse: TokenResponse = await loginUser(email, password);
        setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        setError(null);
        return currentUser;
      } catch (err: any) {
        console.error("Login failed:", err);
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
        setError(err.message || "Login failed. Please check your credentials.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (userData: UserCreate): Promise<UserResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const newUser = await registerUser(userData);
        setError(null);
        return newUser;
      } catch (err: any) {
        console.error("Registration failed:", err);
        setError(err.message || "Registration failed. Please try again.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const googleLoginRedirect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: GoogleAuthUrlResponse = await googleLogin();
      window.location.href = response.auth_url;
    } catch (err: any) {
      console.error("Google login initiation failed:", err);
      setError(err.message || "Google login initiation failed. Please try again.");
      setIsLoading(false);
      throw err;
    }
  }, []);

  // !!! IMPORTANT: This function's logic is now a NO-OP for Google OAuth flow.
  // It remains for type compatibility but should not be called for code exchange.
  const handleGoogleCallback = useCallback(
    async (code: string): Promise<UserResponse> => {
      console.warn("handleGoogleCallback (with code) called on frontend. This function is deprecated for Google OAuth. Your backend should handle code exchange.");
      // This indicates a misconfiguration if called. You might want to throw.
      throw new Error("Frontend handleGoogleCallback should not process 'code'. Backend handles this.");
    },
    []
  );

  const logout = useCallback(async () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      try {
        await revokeToken({
          token: accessToken,
          expires_at: new Date().toISOString(),
        } as TokenRevokeRequest); // Adjust expires_at according to your API
      } catch (err) {
        console.warn("Failed to revoke token on logout (might already be invalid):", err);
      }
    }
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
    router.push("/login");
  }, [router]);

  const verifyEmailAction = useCallback(
    async (data: VerifyEmailRequest): Promise<UserResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const tokenResponse: TokenResponse = await verifyEmail(data);
        setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        setError(null);
        return currentUser;
      } catch (err: any) {
        setError(err.message || "Email verification failed.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const requestPasswordResetAction = useCallback(
    async (data: PasswordResetRequest): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await requestPasswordReset(data);
        setError(null);
        return response.message;
      } catch (err: any) {
        setError(err.message || "Password reset request failed.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const confirmPasswordResetAction = useCallback(
    async (data: PasswordResetConfirm): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await confirmPasswordReset(data);
        setError(null);
        return response.message;
      } catch (err: any) {
        setError(err.message || "Password reset confirmation failed.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchCurrentUser();
  }, [fetchCurrentUser]);


  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    googleLoginRedirect,
    handleGoogleCallback, // Still returned, but logic changed
    logout,
    verifyEmail: verifyEmailAction,
    requestPasswordReset: requestPasswordResetAction,
    confirmPasswordReset: confirmPasswordResetAction,
    revokeToken: useCallback(async (data: TokenRevokeRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        await revokeToken(data);
        logout(); // Full logout if current token is revoked
      } catch (err: any) {
        setError(err.message || 'Failed to revoke token.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, [logout]),
    refreshUser,
    setTokens,        // Explicitly exposed
    fetchCurrentUser, // Explicitly exposed
  };
}