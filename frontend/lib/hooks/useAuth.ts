    "use client";

    import { useState, useEffect, useCallback } from "react";
    import {
      loginUser,
      registerUser,
      googleLogin,
      googleCallback,
      verifyEmail,
      requestPasswordReset,
      confirmPasswordReset,
      revokeToken,
      getCurrentUser,
      setTokens,
      clearTokens,
      getAccessToken,
      getRefreshToken,
    } from "@/lib/utils/user-api"; // Adjust path as needed
    import {
      UserCreate,
      TokenResponse,
      UserResponse,
      VerifyEmailRequest,
      PasswordResetRequest,
      PasswordResetConfirm,
      TokenRevokeRequest,
      GoogleAuthUrlResponse,
    } from "@/lib/user"; // Adjust path as needed

    interface AuthState {
      user: UserResponse | null;
      isAuthenticated: boolean;
      isLoading: boolean;
      error: string | null;
    }

    interface AuthActions {
      login: (email: string, password: string) => Promise<UserResponse>;
      register: (userData: UserCreate) => Promise<UserResponse>;
      googleLoginRedirect: () => Promise<void>;
      handleGoogleCallback: (code: string) => Promise<UserResponse>;
      logout: () => Promise<void>;
      verifyEmail: (data: VerifyEmailRequest) => Promise<UserResponse>;
      requestPasswordReset: (data: PasswordResetRequest) => Promise<string>;
      confirmPasswordReset: (data: PasswordResetConfirm) => Promise<string>;
      refreshUser: () => Promise<void>;
    }

    export function useAuth(): AuthState & AuthActions {
      const [user, setUser] = useState<UserResponse | null>(null);
      const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

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
          clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      }, []);

      useEffect(() => {
        fetchCurrentUser();
      }, [fetchCurrentUser]);

      const login = useCallback(
        async (email: string, password: string): Promise<UserResponse> => {
          setIsLoading(true);
          setError(null);
          try {
            const tokenResponse: TokenResponse = await loginUser(email, password);
            setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
            // After setting tokens, fetch the user details to update state
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
            setError(null);
            return currentUser;
          } catch (err: any) {
            setError(err.message || "Login failed.");
            setIsLoading(false);
            setIsAuthenticated(false);
            throw err;
          }
        },
        [] // Removed `user` from dependency array as it's set internally by fetchCurrentUser
      );

      const register = useCallback(
        async (userData: UserCreate): Promise<UserResponse> => {
          setIsLoading(true);
          setError(null);
          try {
            const newUser = await registerUser(userData);
            setError(null);
            setIsLoading(false);
            // If registration auto-logs in, you'd handle tokens/user fetch here
            return newUser;
          } catch (err: any) {
            setError(err.message || "Registration failed.");
            setIsLoading(false);
            throw err;
          }
        },
        []
      );

      const googleLoginRedirect = useCallback(async () => {
        try {
          const response: GoogleAuthUrlResponse = await googleLogin();
          window.location.href = response.auth_url;
        } catch (err: any) {
          setError(err.message || "Google login initiation failed.");
          throw err;
        }
      }, []);

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
            setError(err.message || "Google callback failed.");
            setIsLoading(false);
            setIsAuthenticated(false);
            throw err;
          }
        },
        [] // Removed `user` from dependency array
      );

      const logout = useCallback(async () => {
        const accessToken = getAccessToken();
        if (accessToken) {
          try {
            await revokeToken({
              token: accessToken,
              expires_at: new Date().toISOString(),
            } as TokenRevokeRequest);
          } catch (err) {
            console.warn(
              "Failed to revoke token on logout (might already be invalid):",
              err
            );
          }
        }
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
        setIsLoading(false);
      }, []);

      const verifyEmailAction = useCallback(
        async (data: VerifyEmailRequest): Promise<UserResponse> => {
          setIsLoading(true);
          setError(null);
          try {
            const tokenResponse: TokenResponse = await verifyEmail(data);
            setTokens(tokenResponse.access_token, tokenResponse.refresh_token);
            // After setting tokens, fetch the user details to update state
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
            setError(null);
            return currentUser;
          } catch (err: any) {
            setError(err.message || "Email verification failed.");
            setIsLoading(false);
            setIsAuthenticated(false);
            throw err;
          }
        },
        [] // Removed `user` from dependency array
      );

      const requestPasswordResetAction = useCallback(
        async (data: PasswordResetRequest): Promise<string> => {
          setIsLoading(true);
          setError(null);
          try {
            const response = await requestPasswordReset(data);
            setError(null);
            setIsLoading(false);
            return response.message;
          } catch (err: any) {
            setError(err.message || "Password reset request failed.");
            setIsLoading(false);
            throw err;
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
            setIsLoading(false);
            return response.message;
          } catch (err: any) {
            setError(err.message || "Password reset confirmation failed.");
            setIsLoading(false);
            throw err;
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
        handleGoogleCallback,
        logout,
        verifyEmail: verifyEmailAction,
        requestPasswordReset: requestPasswordResetAction,
        confirmPasswordReset: confirmPasswordResetAction,
        refreshUser,
      };
    }
    