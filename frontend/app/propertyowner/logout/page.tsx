"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Sidebar from "@/component/dashoboadpropertyowner/sidebar";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    router.back(); // Go back to the previous page
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    toast.loading("Logging out...");

    try {
      await logout();
      toast.dismiss();
      toast.success("You have been logged out.");
      router.push("/login");
    } catch (error) {
      toast.dismiss();
      toast.error("Logout failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Sidebar>
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
            className="bg-[#b8c75b] hover:bg-[#a3b148] text-white py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isLoading ? "Logging out..." : "Confirm"}
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
