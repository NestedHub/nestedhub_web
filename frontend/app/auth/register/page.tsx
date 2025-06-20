"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { uploadFileToCloudinary } from "@/lib/utils/user-api";
import { UserCreate, UserRole } from "@/lib/user"; // Ensure these types are correct and available
import { useAuthContext } from "@/lib/context/AuthContext"; // Import useAuthContext

// Define the shape of our form data, extending UserCreate for file handling
type RegistrationFormData = Omit<UserCreate, 'id_card_url' | 'profile_picture_url' | 'role'> & {
  profilePictureFile: File | null;
  idCardFile: File | null;
  role: 'customer' | 'property_owner' | ''; // Add a default empty string for initial state
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthContext(); // Get the register function from AuthContext
  const [step, setStep] = useState(1); // 1: Role selection, 2: Form fields
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    phone: "",
    role: "", // Will be set in step 1
    password: "",
    profilePictureFile: null,
    idCardFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRoleSelect = (role: 'customer' | 'property_owner') => {
    setFormData((prev) => ({ ...prev, role }));
    setStep(2); // Move to the next step
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on change
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

      // Upload profile picture if available
      if (formData.profilePictureFile) {
        setMessage("Uploading profile picture...");
        profilePictureUrl = await uploadFileToCloudinary(formData.profilePictureFile);
      }

      // Upload ID card if role is property_owner and file is available
      if (formData.role === "property_owner" && formData.idCardFile) {
        setMessage("Uploading ID card...");
        idCardUrl = await uploadFileToCloudinary(formData.idCardFile);
      } else if (formData.role === "property_owner" && !formData.idCardFile) {
        // Property owner requires ID card
        setError("Property owners must upload an ID card.");
        setLoading(false);
        return;
      }

      // Prepare user data for registration
      const userCreateData: UserCreate = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as UserRole,
        password: formData.password,
        profile_picture_url: profilePictureUrl || undefined, // Set to undefined if empty
        id_card_url: idCardUrl || undefined, // Set to undefined if empty
      };

      setMessage("Registering user...");
      const response = await register(userCreateData); // Use the register function from AuthContext
      setMessage(`Registration successful for ${response.email}! Please check your email for verification. 
        ${response.role === 'property_owner' ? 'Property owners require admin approval.' : ''}`);
      
      // Optionally clear form data after successful registration
      setFormData({
        name: "", email: "", phone: "", role: "", password: "",
        profilePictureFile: null, idCardFile: null
      });

      // Optionally redirect to login or a success page after a delay
      setTimeout(() => router.push('/login'), 3000);

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-green-700">Choose Your Role</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={() => handleRoleSelect('customer')}
          className="flex-1 py-4 px-6 border border-green-300 rounded-xl shadow-sm text-lg font-medium text-green-800 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out"
        >
          Register as Customer
        </button>
        <button
          type="button"
          onClick={() => handleRoleSelect('property_owner')}
          className="flex-1 py-4 px-6 border border-blue-300 rounded-xl shadow-sm text-lg font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
        >
          Register as Property Owner
        </button>
      </div>
      <div className="mt-4 text-center">
        <Link href="/login" className="text-green-800 hover:text-green-700 font-medium">
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );

  const renderRegistrationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-green-700">Register as {formData.role === 'customer' ? 'Customer' : 'Property Owner'}</h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {message && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="text-sm text-blue-700">{message}</div>
        </div>
      )}

      {/* Common Fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          value={formData.phone || ""}
          onChange={handleChange}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      {/* Profile Picture Upload (for both roles) */}
      <div>
        <label htmlFor="profilePictureFile" className="block text-sm font-medium text-gray-700">Profile Picture</label>
        <input
          id="profilePictureFile"
          name="profilePictureFile"
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          onChange={handleFileChange}
          disabled={loading}
        />
        {formData.profilePictureFile && (
          <p className="mt-1 text-xs text-gray-500">Selected: {formData.profilePictureFile.name}</p>
        )}
      </div>

      {/* Conditional: ID Card Upload for Property Owners */}
      {formData.role === 'property_owner' && (
        <div>
          <label htmlFor="idCardFile" className="block text-sm font-medium text-gray-700">ID Card (Required for Property Owners)</label>
          <input
            id="idCardFile"
            name="idCardFile"
            type="file"
            accept="image/*"
            required // Required for property owners
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            onChange={handleFileChange}
            disabled={loading}
          />
          {formData.idCardFile && (
            <p className="mt-1 text-xs text-gray-500">Selected: {formData.idCardFile.name}</p>
          )}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg shadow-md transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-gray-700"
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Register Account"
          )}
        </button>
      </div>
      <div className="mt-4 text-center">
        <Link href="/login" className="text-green-800 hover:text-green-700 font-medium">
          Already have an account? Sign In
        </Link>
      </div>
      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={() => { setStep(1); setError(''); setMessage(''); }}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          &larr; Back to Role Selection
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-2xl space-y-8">
        {step === 1 && renderRoleSelection()}
        {step === 2 && renderRegistrationForm()}
      </div>
    </div>
  );
}
