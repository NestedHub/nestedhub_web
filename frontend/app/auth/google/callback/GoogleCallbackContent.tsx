// app/auth/google/callback/GoogleCallbackContent.tsx
// Updated: June 21, 2025

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, fetchCurrentUser, user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [message, setMessage] = useState("Processing Google login...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // Get tokens and potential error from URL parameters
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const errorParam = searchParams.get("error"); // Error from backend (e.g., if Google login failed)

      // If already authenticated and user data is present, redirect to dashboard
      if (isAuthenticated && user) {
        setMessage("Already logged in. Redirecting...");
        if (user.role === "customer") {
          router.push("/user");
        } else if (user.role === "property_owner") {
          router.push("/propertyowner/dashboard");
        } else if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard"); // Fallback
        }
        return;
      }

      // Handle errors from the backend redirect
      if (errorParam) {
        console.error("Google authentication error from backend:", errorParam);
        const decodedError = decodeURIComponent(errorParam);
        setError(decodedError);
        setMessage("Login failed.");
        router.push(`/login?error=${encodeURIComponent(decodedError)}`);
        return;
      }

      // If tokens are present, process them
      if (accessToken && refreshToken) {
        try {
          setMessage("Authentication tokens received. Finalizing login...");
          setTokens(accessToken, refreshToken); // Store the tokens
          await fetchCurrentUser(); // Fetch user details and update context state

          // The `isAuthenticated` and `user` state should now be updated in the context.
          // The `useEffect` in LoginPage (or a global auth guard) will handle the final redirect.
          // For immediate feedback or if no global redirect exists, you could add:
          // if (user && user.role) { // User from fetchCurrentUser
          //   // ... role-based redirect
          // } else {
          //   router.push("/dashboard");
          // }
          // However, relying on the `useAuthContext`'s `isAuthenticated` and `user`
          // in a global effect (like in `LoginPage`) is generally cleaner.
        } catch (err: any) {
          console.error("Failed to process tokens or fetch user after Google login:", err);
          const errorMessage = err.message || "Failed to log in with Google. Please try again.";
          setError(errorMessage);
          setMessage("Login failed.");
          router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
        }
      } else {
        // This case indicates an issue if no error was passed, but no tokens either
        setError("No authentication tokens found in URL. Google login failed.");
        setMessage("Login failed.");
        router.push("/login?error=no_auth_tokens");
      }
    };

    // Only run the processing if not already authenticated and not in a loading state
    // that indicates current authentication attempt.
    if (!isAuthenticated && !authLoading) {
      processCallback();
    }
  }, [searchParams, router, setTokens, fetchCurrentUser, user, isAuthenticated, authLoading]);

  // Optionally, add a separate useEffect here to handle redirection once `isAuthenticated` and `user` are true
  useEffect(() => {
    if (isAuthenticated && user && !error) { // Only redirect if authenticated and no error
        setMessage("Login successful! Redirecting...");
        let redirectPath = "/dashboard"; // Default fallback
        switch (user.role) {
            case "customer":
                redirectPath = "/user";
                break;
            case "property_owner":
                redirectPath = "/propertyowner/dashboard";
                break;
            case "admin":
                redirectPath = "/admin/dashboard";
                break;
            default:
                console.warn("Unknown user role, redirecting to default dashboard.");
                break;
        }
        // Use a timeout to ensure state updates are fully processed before redirect
        const timer = setTimeout(() => {
            router.push(redirectPath);
        }, 1500); // Give it a moment for the message to display
        return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [isAuthenticated, user, router, error]); // Depend on isAuthenticated, user, and router

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl space-y-8 text-center">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-800">
        Google Login
      </h2>
      <p className="text-gray-700">{message}</p>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {!error && (
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}