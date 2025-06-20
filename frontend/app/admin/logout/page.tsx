"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminSidebar from "@/component/admin/sidebar";
import { adminApi } from "@/lib/api/admin";
import { toast } from "react-hot-toast";

export default function AdminLogoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    router.push("/admin/dashboard");
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await adminApi.logout(token);
      }
    } catch (error) {
      // Even if backend logout fails, proceed with client-side logout
      console.error("Logout failed", error);
    } finally {
      // Clear all user-related data from storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      toast.success("Logged out successfully");

      // Redirect to login page
      router.push("/login");
    }
  };

  return (
    <AdminSidebar>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="mb-4">
          <Image
            src="/logogreen.png"
            alt="NestedHub Logo"
            width={200}
            height={60}
          />
        </div>

        <h1 className="text-2xl font-bold mb-6">Log Out</h1>

        <p className="text-lg mb-8">Are you sure you want to log out?</p>

        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-800 hover:bg-green-700 text-white py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isLoading ? "Logging out..." : "Confirm"}
          </button>
        </div>
      </div>
    </AdminSidebar>
  );
}
