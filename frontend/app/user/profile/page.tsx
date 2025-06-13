// app/user/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserUpdate } from '@/lib/user';
import { useRouter } from 'next/navigation';
import { Loader2, User, Mail, Phone, Lock, Save, XCircle, CheckCircle, AlertCircle, BadgeCheck, Edit, LogOut } from 'lucide-react';

import Link from 'next/link';
import Header from '@/component/user/header';
import Footer from '@/component/user/footer';

const UserAvatar = ({ name, imageUrl }: { name: string; imageUrl?: string | null }) => {
  const safeName = name || '';
  const initial = safeName.length > 0 ? safeName.charAt(0).toUpperCase() : '';

  const hasValidImageUrl = typeof imageUrl === 'string' && imageUrl.trim() !== '';

  return (
    <div className="flex justify-center mb-6">
      {hasValidImageUrl ? (
        <img
          src={imageUrl as string}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-green-400 shadow-lg transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-36 h-36 rounded-full flex items-center justify-center bg-green-500 text-white text-5xl font-bold shadow-lg transition-transform duration-300 hover:scale-0 border-4 border-green-400">
          {initial}
        </div>
      )}
    </div>
  );
};

export default function UserProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { currentUser, isLoading, error, updateProfile, refetchCurrentUser } = useCurrentUser();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      // It's crucial that this redirect happens consistently
      // to avoid UI "freaking out" when not authenticated.
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    if (!currentUser) {
      setSubmitError("No user data available to update.");
      setIsSubmitting(false);
      return;
    }

    const updatedData: UserUpdate = {
      name,
      phone,
    };

    try {
      await updateProfile(updatedData);
      setSubmitSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setSubmitError(err.message || "An unexpected error occurred during update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MODIFIED LOGOUT HANDLER ---
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect to /user instead of /login after successful logout
      router.push('/user');
    } catch (err) {
      console.error("Logout failed:", err);
      // Optionally display a logout error message to the user
      // For example: setSubmitError("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };
  // --- END MODIFIED LOGOUT HANDLER ---

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-xl text-gray-700 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="mt-2 text-lg text-gray-700 mb-8">Please log in to view your profile.</p>
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-red-600 mb-3">Error Loading Profile</h2>
          <p className="mt-2 text-lg text-gray-700 mb-8">{error}</p>
          <button
            onClick={refetchCurrentUser}
            className="w-full px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No Profile Data Available</h2>
          <p className="mt-2 text-lg text-gray-700">Could not retrieve your user information. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-xl p-8 sm:p-10 lg:p-12 border border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center pb-6 border-b-2 border-green-500/50">
            My Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <UserAvatar
              name={currentUser.name || currentUser.email || 'User'}
              imageUrl={currentUser.profile_picture_url}
            />

            <div>
              <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2 text-green-500" /> Full Name
              </label>
              <input
                type="text"
                id="name"
                className={`w-full px-4 py-3 border ${isEditing ? 'border-green-400 focus:ring-green-500 focus:border-green-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'} rounded-lg shadow-sm text-gray-800 text-base transition-all duration-200`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-2 text-green-500" /> Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-lg shadow-sm text-gray-600 text-base cursor-not-allowed opacity-80"
                value={currentUser.email || ''}
                disabled={true}
              />
              {currentUser.is_email_verified ? (
                <p className="mt-2 text-sm text-green-600 flex items-center font-medium">
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Email Verified
                </p>
              ) : (
                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                  <AlertCircle className="h-4 w-4 mr-1.5" /> Email Not Verified (Consider adding a "Resend Verification" button)
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Phone className="h-4 w-4 mr-2 text-green-500" /> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className={`w-full px-4 py-3 border ${isEditing ? 'border-green-400 focus:ring-green-500 focus:border-green-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'} rounded-lg shadow-sm text-gray-800 text-base transition-all duration-200`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="h-4 w-4 mr-2 text-green-500" /> Role
                </label>
                <p className="px-4 py-3 bg-gray-100 rounded-lg text-gray-800 text-base font-medium capitalize shadow-sm">
                  {currentUser.role}
                </p>
              </div>
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <BadgeCheck className="h-4 w-4 mr-2 text-green-500" /> Approval Status
                </label>
                <p className={`px-4 py-3 rounded-lg text-base font-medium shadow-sm ${currentUser.is_approved ? 'text-green-700 bg-green-50' : 'text-yellow-700 bg-yellow-50'}`}>
                  {currentUser.is_approved ? 'Approved' : 'Pending Approval'}
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div className="bg-green-50 border border-green-300 text-green-800 px-5 py-4 rounded-lg relative shadow-md" role="alert">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0" />
                  <span className="font-medium text-base">{submitSuccess}</span>
                </div>
              </div>
            )}
            {submitError && (
              <div className="bg-red-50 border border-red-300 text-red-800 px-5 py-4 rounded-lg relative shadow-md" role="alert">
                <div className="flex items-center">
                  <XCircle className="h-6 w-6 mr-3 flex-shrink-0" />
                  <span className="font-medium text-base">{submitError}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
                >
                  <Edit className="mr-2 h-5 w-5" /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (currentUser) {
                        setName(currentUser.name || '');
                        setPhone(currentUser.phone || '');
                      }
                      setSubmitError(null);
                      setSubmitSuccess(null);
                    }}
                    className="inline-flex items-center px-8 py-3 border border-gray-300 text-lg font-semibold rounded-lg shadow-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <XCircle className="mr-2 h-5 w-5" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-5 w-5" />
                    )}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>

            <div className="pt-6 border-t-2 border-gray-100 mt-6 flex justify-between items-center">
                <Link href="/user/change-password" className="text-green-600 hover:text-green-700 font-semibold text-base transition-colors duration-200 flex items-center">
                    <Lock className="h-4 w-4 mr-2" /> Change Password
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  {isLoggingOut ? 'Logging Out...' : 'Logout'}
                </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}