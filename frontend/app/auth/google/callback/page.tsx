// app/auth/google/callback/page.tsx
// No changes needed.

"use client";

import dynamic from "next/dynamic";

const GoogleCallbackContent = dynamic(
  () => import("./GoogleCallbackContent"),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-800">
          Google Login
        </h2>
        <p className="text-gray-700">Loading Google authentication...</p>
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    ),
  }
);

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <GoogleCallbackContent />
    </div>
  );
}