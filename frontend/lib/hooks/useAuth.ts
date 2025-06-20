"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  loginUser,
  registerUser,
  googleLogin, // Keep this as it returns GoogleAuthUrlResponse
  googleCallback,
  verifyEmail,
  requestPasswordReset,
  confirmPasswordReset,
  revokeToken,
  getCurrentUser,
  setTokens,
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
} from "@/lib/user"; // Adjust path as needed for your types

// Define the return type of the useAuth hook
interface UseAuthResult {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserResponse>;
  register: (userData: UserCreate) => Promise<UserResponse>;
  googleLoginRedirect: () => Promise<void>; // Updated to reflect GoogleAuthUrlResponse from API call
  handleGoogleCallback: (code: string) => Promise<UserResponse>;
  logout: () => Promise<void>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<UserResponse>;
  requestPasswordReset: (data: PasswordResetRequest) => Promise<string>;
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<string>;
  revokeToken: (data: TokenRevokeRequest) => Promise<void>;
  refreshUser: () => Promise<void>; // This is the function we will expose for refetching
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Manages loading state for initial fetch and login
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
      setError(err.message || "Failed to load user data.");
      clearTokens(); // Clear tokens if current user fetch fails (e.g., token expired)
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]); // Dependency array includes fetchCurrentUser

  // --- Authentication Actions ---

  // 1. Standard Email/Password Login
  const login = useCallback(
    async (email: string, password: string): Promise<UserResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const tokenResponse: TokenResponse = await loginUser(email, password);
        setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
        // After setting tokens, immediately fetch the user details to update state
        const currentUser = await getCurrentUser(); // Call getCurrentUser
        setUser(currentUser);
        setIsAuthenticated(true);
        setError(null);
        return currentUser;
      } catch (err: any) {
        console.error("Login failed:", err);
        clearTokens(); // Clear tokens on login failure
        setUser(null);
        setIsAuthenticated(false);
        setError(err.message || "Login failed. Please check your credentials.");
        throw err; // Re-throw to allow calling component to catch
      } finally {
        setIsLoading(false);
      }
    },
    [] // No dependencies required as it's a direct API call followed by internal state updates
  );

  // 2. User Registration
  const register = useCallback(
    async (userData: UserCreate): Promise<UserResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const newUser = await registerUser(userData);
        setError(null);
        // Registration typically doesn't immediately log in or provide tokens
        // User will likely need to verify email or wait for admin approval
        return newUser; // Return the user response for handling in the component
      } catch (err: any) {
        console.error("Registration failed:", err);
        setError(err.message || "Registration failed. Please try again.");
        throw err; // Re-throw for component to handle
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 3. Google Login (Initiates Redirect)
  const googleLoginRedirect = useCallback(async () => {
    setIsLoading(true); // Indicate loading as we are initiating a redirect
    setError(null);
    try {
      const response: GoogleAuthUrlResponse = await googleLogin();
      // The backend should respond with the actual Google auth URL
      window.location.href = response.auth_url;
      // No need to set isLoading(false) here as the page will redirect
    } catch (err: any) {
      console.error("Google login initiation failed:", err);
      setError(err.message || "Google login initiation failed. Please try again.");
      setIsLoading(false); // Set back to false if redirect fails
      throw err;
    }
  }, []);

  // 4. Google OAuth2 Callback Handler
  const handleGoogleCallback = useCallback(
    async (code: string): Promise<UserResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const tokenResponse: TokenResponse = await googleCallback(code);
        setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
        // After setting tokens, fetch the user details to update state
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        setError(null);
        return currentUser;
      } catch (err: any) {
        console.error("Google callback failed:", err);
        clearTokens(); // Clear tokens if callback fails
        setUser(null);
        setIsAuthenticated(false);
        setError(err.message || "Failed to log in with Google. Please try again.");
        throw err; // Re-throw for component to handle
      } finally {
        setIsLoading(false);
      }
    },
    [] // No dependencies required here
  );

  // 5. Logout
  const logout = useCallback(async () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      try {
        // Attempt to revoke the token, but don't block logout if it fails
        await revokeToken({
          token: accessToken,
          expires_at: new Date().toISOString(), // Or handle according to your API's spec
        } as TokenRevokeRequest);
      } catch (err) {
        console.warn(
          "Failed to revoke token on logout (might already be invalid):",
          err
        );
      }
    }
    clearTokens(); // Always clear client-side tokens
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false); // Logout is an immediate action for UI
    router.push("/login"); // Redirect to login page after logout
  }, [router]);

  // --- Password Management & Email Verification ---
  const verifyEmailAction = useCallback(
    async (data: VerifyEmailRequest): Promise<UserResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const tokenResponse: TokenResponse = await verifyEmail(data);
        setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
        const currentUser = await getCurrentUser(); // Refresh user state
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

  // Expose fetchCurrentUser as refreshUser for external component use
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchCurrentUser(); // Use the internal fetchCurrentUser
  }, [fetchCurrentUser]);


  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    googleLoginRedirect,
    handleGoogleCallback,
    logout,
    verifyEmail: verifyEmailAction,
    requestPasswordReset: requestPasswordResetAction,
    confirmPasswordReset: confirmPasswordResetAction,
    revokeToken: useCallback(async (data: TokenRevokeRequest) => { // Directly include revokeToken
      setIsLoading(true);
      setError(null);
      try {
        await revokeToken(data);
        // If the current token is revoked, force a full logout
        logout();
      } catch (err: any) {
        setError(err.message || 'Failed to revoke token.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }, [logout]),
    refreshUser,
  };
}
