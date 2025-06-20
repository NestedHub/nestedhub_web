"use client"; // This page remains a client component because it uses next/dynamic

import dynamic from "next/dynamic"; // Import dynamic for client-side rendering control

// Dynamically import GoogleCallbackContent with SSR disabled.
// This ensures that useSearchParams (and other client-only hooks within it)
// are only executed in the browser, not during server-side prerendering.
const GoogleCallbackContent = dynamic(
  () => import("./GoogleCallbackContent"),
  {
    ssr: false, // This is the key: tells Next.js NOT to render this component on the server
    loading: () => ( // Optional: A loading fallback to display while the client component loads
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

/**
 * The main Google Callback Page component.
 * It uses a dynamic import with ssr:false to ensure the core logic
 * involving useSearchParams only runs on the client.
 */
export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Render the dynamically imported client-only component */}
      <GoogleCallbackContent />
    </div>
  );
}
