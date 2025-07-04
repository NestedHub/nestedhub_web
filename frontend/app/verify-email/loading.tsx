// app/verify-email/loading.tsx
import React from 'react';

export default function VerifyEmailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center space-y-4">
        <svg
          className="animate-spin h-8 w-8 text-[#20511e]"
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
        <p className="text-gray-700 text-lg">Loading verification form...</p>
      </div>
    </div>
  );
}