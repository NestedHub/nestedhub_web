"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { verifyEmail } from "@/lib/utils/user-api";
import { VerifyEmailRequest } from "@/lib/user";

// Inline SVG Icons (assuming you still need these for the styling)
// (Assuming these are defined elsewhere or not strictly needed for this specific page's function)
// If you need EyeIcon, EyeOffIcon, HomeIcon definitions here, please let me know.


export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState(emailFromUrl);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Update email state if the URL email changes (e.g., user manually types URL)
  useEffect(() => {
    if (emailFromUrl && emailFromUrl !== email) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl, email]);

  const handleCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email || !verificationCode) {
      setError("Email and verification code are required.");
      setLoading(false);
      return;
    }

    try {
      setMessage("Verifying code...");
      const verifyData: VerifyEmailRequest = {
        email: email,
        code: verificationCode,
      };

      console.log("--- Calling verifyEmail ---");
      console.log("verifyData sent to verifyEmail:", verifyData);

      const response = await verifyEmail(verifyData);

      console.log("verifyEmail response:", response);

      setMessage(`Email successfully verified for ${email}! You can now log in.`);

      // Clear the form and redirect to login after a short delay
      setVerificationCode("");

      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(
        err.message ||
        "Verification failed. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="text-sm text-red-700 font-medium">{error}</div>
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="text-sm text-blue-700 font-medium">{message}</div>
          </div>
        )}

        <p className="text-center text-gray-600 text-base">
          A verification code has been sent to{" "}
          <strong>{email || 'your email address'}</strong>. Please enter it below to complete your registration.
        </p>

        <form onSubmit={handleCodeSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="verificationCode"
              className="sr-only"
            >
              Verification Code
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-center tracking-widest text-lg"
              value={verificationCode}
              onChange={(e) => {
                // Now allows alphanumeric characters
                // You can add more specific filtering if needed, e.g., to exclude symbols
                const value = e.target.value.trim(); // Trim whitespace
                setVerificationCode(value);
                setError("");
              }}
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg shadow-md transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20511e] ${
                loading
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-[#20511e] hover:bg-[#1a401a] text-white"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-[#20511e] hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}