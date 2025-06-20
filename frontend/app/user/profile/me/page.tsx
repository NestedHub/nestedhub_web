// app/user/profile/me/page.tsx
"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserUpdate } from '@/lib/user';
import { useRouter } from 'next/navigation';
import {
  Loader2, User, Mail, Phone, Lock, Save, XCircle, CheckCircle, AlertCircle, BadgeCheck, Edit, LogOut, Camera
} from 'lucide-react';

import Link from 'next/link';
import Header from '@/component/user/header';
import Footer from '@/component/user/footer';

// Enhance UserAvatar to handle interactive states and file input
const UserAvatar = ({ name, imageUrl, onImageChange, isUploading }: {
  name: string;
  imageUrl?: string | null;
  onImageChange: (file: File) => void;
  isUploading: boolean;
}) => {
  const safeName = name || '';
  const initial = safeName.length > 0 ? safeName.charAt(0).toUpperCase() : '';
  const hasValidImageUrl = typeof imageUrl === 'string' && imageUrl.trim() !== '';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    // Only allow changing photo if not currently uploading
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImageChange(event.target.files[0]);
    }
    // Reset the file input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex justify-center mb-6 lg:mb-0 relative group">
      <div
        className={`w-36 h-36 rounded-full overflow-hidden border-4 border-green-400 shadow-lg
                   relative transition-transform duration-300 hover:scale-105
                   ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`} // Cursor feedback
        onClick={handleAvatarClick}
      >
        {hasValidImageUrl ? (
          <img
            src={imageUrl as string}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-500 text-white text-5xl font-bold">
            {initial}
          </div>
        )}

        {/* Overlay for "Change Photo" */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-center">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
          <span className="mt-1 text-white text-sm font-semibold whitespace-nowrap">
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </span>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading} // Disable input while uploading
      />
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
  const [isSubmitting, setIsSubmitting] = useState(false); // For profile data update (name, phone)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false); // For image upload state
  const [imageUploadSuccess, setImageUploadSuccess] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);


  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Clear success/error messages when starting to edit
  useEffect(() => {
    if (isEditing) {
      setSubmitSuccess(null);
      setSubmitError(null);
    }
  }, [isEditing]);


  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
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
      // refetchCurrentUser(); // updateProfile in useCurrentUser already triggers a refetch implicitly
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setSubmitError(err.message || "An unexpected error occurred during update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageUploadError(null);
    setImageUploadSuccess(null);
    setIsUploadingImage(true);

    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    // IMPORTANT: Replace 'your_unsigned_upload_preset' with the actual name of your unsigned upload preset
    const UPLOAD_PRESET = 'property_sphere_upload'; // <<-- CONFIRM THIS MATCHES YOUR CLOUDINARY UNSIGNED UPLOAD PRESET

    if (!CLOUDINARY_CLOUD_NAME) {
      setImageUploadError("Cloudinary cloud name is not configured.");
      setIsUploadingImage(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'profile_pictures'); // Optional: organize uploads into a specific folder

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed.');
      }

      const data = await response.json();
      const newImageUrl = data.secure_url;

      // Now, update the user's profile with the new image URL via your backend API
      if (!currentUser) {
        setImageUploadError("User data not available to save new profile picture.");
        return;
      }

      const updatedData: UserUpdate = {
        profile_picture_url: newImageUrl,
      };

      await updateProfile(updatedData); // Assuming updateProfile can handle just image URL
      setImageUploadSuccess("Profile picture updated successfully!");
      // refetchCurrentUser() is implicitly handled by useCurrentUser's SWR/react-query setup
      // if updateProfile invalidates the cache for current user.

    } catch (err: any) {
      console.error("Image upload or profile update failed:", err);
      setImageUploadError(err.message || "An error occurred during image upload.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/user');
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8 sm:p-10 lg:p-12 border border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center pb-6 border-b-2 border-green-500/50">
            My Profile
          </h1>

          <div className="lg:flex lg:space-x-12">
            {/* Left Column: Avatar and Quick Info */}
            <div className="lg:w-1/3 flex flex-col items-center text-center lg:pt-8">
              <UserAvatar
                name={currentUser.name || currentUser.email || 'User'}
                imageUrl={currentUser.profile_picture_url}
                onImageChange={handleImageUpload} // Pass the handler
                isUploading={isUploadingImage} // Pass upload state
              />
              {imageUploadSuccess && (
                <div className="bg-green-50 border border-green-300 text-green-800 px-3 py-2 rounded-lg text-sm mt-4 w-full text-center" role="alert">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>{imageUploadSuccess}</span>
                  </div>
                </div>
              )}
              {imageUploadError && (
                <div className="bg-red-50 border border-red-300 text-red-800 px-3 py-2 rounded-lg text-sm mt-4 w-full text-center" role="alert">
                  <div className="flex items-center justify-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    <span>{imageUploadError}</span>
                  </div>
                </div>
              )}

              <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
                {currentUser.name || 'User Name'}
              </h2>
              <p className="text-lg text-gray-600 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-green-500" /> {currentUser.email}
              </p>
              <p className="text-lg text-gray-600 mb-6 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-500" /> {currentUser.phone || 'N/A'}
              </p>
              <p className={`px-4 py-2 rounded-full text-sm font-medium ${currentUser.is_approved ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'} mb-4`}>
                {currentUser.is_approved ? (
                  <span className="flex items-center"><BadgeCheck className="h-4 w-4 mr-1.5" /> Approved User</span>
                ) : (
                  <span className="flex items-center"><AlertCircle className="h-4 w-4 mr-1.5" /> Pending Approval</span>
                )}
              </p>
              <p className={`px-4 py-2 rounded-full text-sm font-medium text-blue-700 bg-blue-100 capitalize`}>
                <span className="flex items-center"><Lock className="h-4 w-4 mr-1.5" /> Role: {currentUser.role}</span>
              </p>
            </div>

            {/* Right Column: Editable Form Fields */}
            <form onSubmit={handleSubmit} className="lg:w-2/3 space-y-6 lg:pl-8 lg:border-l lg:border-gray-200 lg:py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Edit Details</h2>

              {/* Name Field */}
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

              {/* Email Field (Non-editable) */}
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

              {/* Phone Field */}
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
            </form>
          </div>

          {/* Buttons outside the form (Logout, Change Password) */}
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
        </div>
      </main>
      <Footer />
    </div>
  );
}