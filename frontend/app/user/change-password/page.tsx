// app/user/change-password/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  requestPasswordReset,
  confirmPasswordReset,
} from '@/lib/utils/user-api'; // Import the API functions
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'; // Import useCurrentUser hook
import {
  Loader2, Mail, Lock, CheckCircle, XCircle, ChevronLeft, Send, Save
} from 'lucide-react';
import Header from '@/component/user/header';
import Footer from '@/component/user/footer';

type Step = 'request_code' | 'confirm_reset' | 'success';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser();
  const [step, setStep] = useState<Step>('request_code'); // Current step of the process

  // Form states
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states for API interaction
  const [isLoading, setIsLoading] = useState(false); // For API call loading
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear messages when inputs change
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [code, newPassword, confirmPassword, step]);

  // Handle initial loading and user data
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-xl text-gray-700 font-medium">Loading user data...</p>
      </div>
    );
  }

  if (userError || !currentUser || !currentUser.email) {
    // Redirect to login if not authenticated or email is not available
    // or show an error message
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Authentication Required</h2>
          <p className="mt-2 text-lg text-gray-700 mb-8">
            {userError || "Could not retrieve user email. Please log in again."}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // User's email is now guaranteed to be available here: currentUser.email
  const userEmail = currentUser.email;

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset({ email: userEmail }); // Use the fetched email
      setSuccessMessage("A password reset code has been sent to your email. Please check your inbox.");
      setStep('confirm_reset'); // Move to the next step
    } catch (err: any) {
      console.error("Error requesting password reset code:", err);
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 8) { // Basic password length validation
      setError("New password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await confirmPasswordReset({ email: userEmail, code, new_password: newPassword }); // Use the fetched email
      setSuccessMessage("Your password has been successfully reset! You can now log in with your new password.");
      setStep('success'); // Move to success state
    } catch (err: any) {
      console.error("Error confirming password reset:", err);
      setError(err.message || "Failed to reset password. Please ensure the code is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => {
    switch (step) {
      case 'request_code':
        return (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Change Password</h2>
            <p className="text-gray-600 text-center mb-6">
              To change your password, we'll send a verification code to your email.
            </p>
            <div>
              <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-2 text-green-500" /> Your Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg shadow-sm text-gray-800 text-base cursor-not-allowed opacity-80"
                value={userEmail} // Display the known email
                disabled // Keep it disabled as it's not input by user
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center shadow-md" role="alert">
                <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg flex items-center shadow-md" role="alert">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 font-semibold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending Code...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" /> Send Verification Code
                </>
              )}
            </button>
          </form>
        );

      case 'confirm_reset':
        return (
          <form onSubmit={handleConfirmReset} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Confirm Password Reset</h2>
            <p className="text-gray-600 text-center mb-6">Enter the code sent to {userEmail} and your new password.</p>
            <div>
              <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-2 text-green-500" /> Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg shadow-sm text-gray-800 text-base cursor-not-allowed opacity-80"
                value={userEmail}
                disabled
              />
            </div>
            <div>
              <label htmlFor="code" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Lock className="h-4 w-4 mr-2 text-green-500" /> Verification Code
              </label>
              <input
                type="text"
                id="code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Lock className="h-4 w-4 mr-2 text-green-500" /> New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Lock className="h-4 w-4 mr-2 text-green-500" /> Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center shadow-md" role="alert">
                <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center shadow-md" role="alert">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            )}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep('request_code')}
                className="flex-shrink-0 px-6 py-3 border border-gray-300 text-lg font-semibold rounded-lg shadow-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-grow px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 font-semibold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Resetting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Reset Password
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="text-center p-8 bg-green-50 border border-green-300 rounded-lg shadow-xl">
            <CheckCircle className="mx-auto h-20 w-20 text-green-600 mb-6" />
            <h2 className="text-3xl font-bold text-green-800 mb-4">Password Reset Successful!</h2>
            <p className="text-lg text-gray-700 mb-8">{successMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
            >
              Go to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-xl p-8 sm:p-10 lg:p-12 border border-gray-200">
          {renderFormContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}