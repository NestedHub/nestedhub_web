"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import Link from "next/link";

// Inline SVG Icons (re-using for consistency, especially Eye/EyeOff for password toggle)
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a1.8 1.8 0 0 1 0-.22M4.24 10.66A10.07 10.07 0 0 1 2 12s3 7 10 7c.56 0 1.1-.07 1.62-.2M15 12a3 3 0 1 1-6 0"></path>
    <path d="M2 2l20 20"></path>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    googleLoginRedirect,
    isAuthenticated,
    isLoading: authLoading,
    user,
  } = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const isLoading = localLoading || authLoading;

  useEffect(() => {
    // Only redirect if authentication is complete and user data is available
    if (isAuthenticated && user) {
      switch (user.role) {
        case "customer":
          router.push("/user"); // Assuming /user is the customer dashboard
          break;
        case "property_owner":
          router.push("/propertyowner/dashboard"); // Assuming this is the property owner dashboard
          break;
        case "admin":
          router.push("/admin/dashboard"); // Assuming this is the admin dashboard
          break;
        default:
          console.error("Invalid user role detected after login:", user.role);
          router.push("/"); // Fallback to homepage or a generic dashboard
          break;
      }
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error on new input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLocalLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "An unexpected error occurred during login. Please try again."
        );
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLocalLoading(true);
    try {
      await googleLoginRedirect();
    } catch (err) {
      console.error("Google sign-in initiation failed:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to initiate Google sign-in. Please try again.");
      }
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-['Inter']">
      {/* Left Side - Green Section */}
      <div className="flex-1 bg-[#20511e] relative flex flex-col justify-between p-8 lg:p-12 rounded-r-2xl shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 text-white mb-12">
          <img
            src="/logowhite.png"
            alt="NestHub Logo"
            className="w-16 h-16 object-contain"
          />
          <span className="text-3xl font-bold tracking-wide">NESTHUB</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-8">
            Welcome back to your perfect property search.
          </h1>
          <p className="text-white text-lg opacity-90">
            Log in to continue exploring homes and managing your listings.
          </p>
        </div>

        {/* House Image - Adjusted to take full width and be at the bottom */}
        {/* Added 'absolute', 'bottom-0', 'left-0', 'right-0' and removed 'mt-12' and 'max-w-md' from inner div */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full">
            {" "}
            {/* This div now ensures the image container takes full width */}
            <img
              src="/modern-residential.png"
              alt="Modern house"
              className="w-full h-auto object-cover rounded-bl-2xl rounded-br-2xl lg:rounded-bl-none lg:rounded-br-none" // Use object-cover and adjust corner rounding
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form Section (Styled like registration pages) */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 rounded-l-2xl shadow-xl">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Sign In to NestHub
            </h2>
            <p className="text-gray-600 text-base">
              Access your account and manage your properties or find your dream
              home.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          )}
          {authLoading &&
            !localLoading && ( // Show authLoading if not localLoading (e.g., initial auth check)
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">
                  Checking authentication status...
                </div>
              </div>
            )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-500 focus:border-[#20511e] focus:ring-2 focus:ring-[#20511e] focus:outline-none transition-all duration-200"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-500 focus:border-[#20511e] focus:ring-2 focus:ring-[#20511e] focus:outline-none transition-all duration-200"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-[#20511e] hover:bg-[#1a401a] text-white shadow-md"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">
              Or continue with
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full h-12 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-3 transition-colors duration-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                {/* Replaced img src with inline SVG for Google icon for completeness */}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        {/* Footer Links - Added Register button/link */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-gray-600 text-base">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[#20511e] hover:underline font-semibold"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
