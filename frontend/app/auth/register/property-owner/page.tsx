"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Use Link for internal navigation

import { uploadFileToCloudinary } from "@/lib/utils/user-api";
import { UserCreate, UserRole } from "@/lib/user"; // Import UserRole
import { useAuthContext } from "@/lib/context/AuthContext";

// Inline SVG Icons (assuming you still need these for the styling)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a1.8 1.8 0 0 1 0-.22M4.24 10.66A10.07 10.07 0 0 1 2 12s3 7 10 7c.56 0 1.1-.07 1.62-.2M15 12a3 3 0 1 1-6 0"></path>
    <path d="M2 2l20 20"></path>
  </svg>
);

const HomeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);


type PropertyOwnerRegistrationFormData = Omit<UserCreate, 'id_card_url' | 'profile_picture_url' | 'role'> & {
  profilePictureFile: File | null;
  idCardFile: File | null; // Required for property owners
};

export default function PropertyOwnerRegisterPage() {
  const router = useRouter();
  const { register } = useAuthContext();

  const [formData, setFormData] = useState<PropertyOwnerRegistrationFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    profilePictureFile: null,
    idCardFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }));
    }
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      let profilePictureUrl = "";
      let idCardUrl = "";

      if (formData.profilePictureFile) {
        setMessage("Uploading profile picture...");
        profilePictureUrl = await uploadFileToCloudinary(formData.profilePictureFile);
      }

      // Property owner specific: ID Card upload
      if (!formData.idCardFile) {
        setError("Property owners must upload an ID card.");
        setLoading(false);
        return;
      }
      setMessage("Uploading ID card...");
      idCardUrl = await uploadFileToCloudinary(formData.idCardFile);


      const userCreateData: UserCreate = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: 'property_owner' as UserRole, // Hardcode role for this page
        password: formData.password,
        profile_picture_url: profilePictureUrl || undefined,
        id_card_url: idCardUrl, // ID card is now guaranteed to be a string
      };

      setMessage("Registering property owner account...");
      const response = await register(userCreateData);

      // Use the actual response structure
      setMessage(`Registration successful for ${response.email}! Please check your email for a verification code.`);
      // Redirect to a dedicated email verification page
      router.push(`/verify-email?email=${formData.email}`);

    } catch (err: any) {
      console.error("Property Owner Registration error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
            Register your property with ease.
          </h1>
          <p className="text-white text-lg opacity-90">
            List your properties and connect with potential tenants effortlessly.
          </p>
        </div>

        {/* House Image (Using actual image from public folder) */}
        <div className="flex justify-center mt-12">
          <div className="relative w-full max-w-md">
            <img
              src="/modern-residential.png"
              alt="Modern house"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 rounded-l-2xl shadow-xl">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900">Create Your Property Owner Account</h2>
            <p className="text-gray-600 text-base">
              By continuing, you agree to NestHub's <a href="#" className="text-[#20511e] hover:underline font-medium">Terms of Use</a>.
            </p>
          </div>

          {/* Messages */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-500 focus:border-[#20511e] focus:ring-2 focus:ring-[#20511e] focus:outline-none transition-all duration-200"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                autoComplete="email"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-500 focus:border-[#20511e] focus:ring-2 focus:ring-[#20511e] focus:outline-none transition-all duration-200"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-500 focus:border-[#20511e] focus:ring-2 focus:ring-[#20511e] focus:outline-none transition-all duration-200"
                value={formData.phone || ""}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                autoComplete="new-password"
                required
                className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder:text-gray-500 focus:border-[#20511e] focus:ring-2 focus:ring-[#20511e] focus:outline-none transition-all duration-200"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label htmlFor="profilePictureFile" className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Optional)</label>
              <input
                id="profilePictureFile"
                name="profilePictureFile"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none"
                onChange={handleFileChange}
                disabled={loading}
              />
              {formData.profilePictureFile && (
                <p className="mt-2 text-xs text-gray-500">Selected: {formData.profilePictureFile.name}</p>
              )}
            </div>

            {/* ID Card Upload (REQUIRED for property owners) */}
            <div>
              <label htmlFor="idCardFile" className="block text-sm font-medium text-gray-700 mb-2">ID Card (Required)</label>
              <input
                id="idCardFile"
                name="idCardFile"
                type="file"
                accept="image/*"
                required // This is now required
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 focus:outline-none"
                onChange={handleFileChange}
                disabled={loading}
              />
              {formData.idCardFile && (
                <p className="mt-2 text-xs text-gray-500">Selected: {formData.idCardFile.name}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-[#20511e] hover:bg-[#1a401a] text-white shadow-md"
              }`}
            >
              {loading ? (
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
                  Processing...
                </>
              ) : (
                "Register Property Owner Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full h-12 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-3 transition-colors duration-200 shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            Continue with Google
          </button>

          {/* Footer Links */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-gray-600 text-base">
              Already have an account?{" "}
              <Link href="/login" className="text-[#20511e] hover:underline font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}