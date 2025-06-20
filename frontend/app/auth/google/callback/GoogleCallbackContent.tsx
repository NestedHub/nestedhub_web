"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";

/**
 * GoogleCallbackContent handles the client-side logic for the Google OAuth callback.
 * It extracts the 'code' from the URL, calls the authentication API, and redirects
 * the user upon successful login.
 */
export default function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook is sensitive to SSR, handled by parent Suspense
  const { handleGoogleCallback, user, isAuthenticated } = useAuthContext();
  const [message, setMessage] = useState("Processing Google login...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");

      // If already authenticated and user data is present, no need to process callback again
      if (isAuthenticated && user) {
        setMessage("Already logged in. Redirecting...");
        // Redirect to the correct dashboard based on role
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

      if (code) {
        try {
          setMessage("Authenticating with Google...");
          // Call the handleGoogleCallback from useAuthContext
          const loggedInUser = await handleGoogleCallback(code);

          setMessage("Login successful! Redirecting...");
          // Redirect based on the role of the user returned from handleGoogleCallback
          if (loggedInUser.role === "customer") {
            router.push("/user");
          } else if (loggedInUser.role === "property_owner") {
            router.push("/propertyowner/dashboard");
          } else if (loggedInUser.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard"); // Fallback
          }
        } catch (err: any) {
          console.error("Google callback failed:", err);
          setError(err.message || "Failed to log in with Google. Please try again.");
          setMessage("Login failed.");
          router.push(`/login?error=${encodeURIComponent(err.message || 'Google login failed')}`);
        }
      } else {
        // If no code is present in the URL
        setError("No authorization code found in URL.");
        setMessage("Login failed.");
        router.push("/login?error=no_auth_code");
      }
    };

    // Execute the processCallback function.
    // The parent Suspense ensures this component (and useSearchParams) only runs on the client.
    processCallback();
  }, [searchParams, router, handleGoogleCallback, user, isAuthenticated]);

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
