"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import Sidebar from "@/component/dashoboadpropertyowner/sidebar";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function SettingsPage() {
  const { currentUser, isLoading, updateProfile, refetchCurrentUser } = useCurrentUser();

  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [passwordInfo, setPasswordInfo] = useState({ newPassword: "", confirmPassword: "" });
  const [isInfoSubmitting, setIsInfoSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserInfo({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInfoSubmitting(true);
    toast.loading("Updating profile...");

    try {
      await updateProfile({ name: userInfo.name });
      refetchCurrentUser(); // Re-fetch user data to update UI
      toast.dismiss();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsInfoSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!passwordInfo.newPassword) {
      toast.error("Password cannot be empty.");
      return;
    }

    setIsPasswordSubmitting(true);
    toast.loading("Changing password...");

    try {
      await updateProfile({ password: passwordInfo.newPassword });
      setPasswordInfo({ newPassword: "", confirmPassword: "" });
      toast.dismiss();
      toast.success("Password changed successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to change password.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading settings...</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">User Profile</h2>
          <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24">
                <Image
                  src={currentUser?.profile_picture_url || "/avatar-placeholder.png"}
                  alt="User Avatar"
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white shadow object-cover"
                />
              </div>
            </div>

            <div className="flex-grow max-w-md">
              <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={userInfo.name}
                    onChange={handleUserInfoChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={userInfo.email}
                    readOnly
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isInfoSubmitting}
                    className="bg-[#b8c75b] hover:bg-[#a3b148] text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 flex items-center"
                  >
                    {isInfoSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-md">
          <h2 className="text-lg font-medium mb-4">Change password</h2>
          <div className="bg-white p-6 rounded-lg border">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordInfo.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={passwordInfo.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="bg-[#b8c75b] hover:bg-[#a3b148] text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 flex items-center"
                >
                  {isPasswordSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save new password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
