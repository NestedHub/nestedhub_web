"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminSidebar from "@/component/admin/sidebar"

export default function AdminLogoutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = () => {
    router.push("/admin/dashboard")
  }

  const handleConfirm = () => {
    setIsLoading(true)

    // Clear admin data from storage
    localStorage.removeItem("admin")

    // Redirect to admin login page after a short delay
    setTimeout(() => {
      router.push("/admin-login")
    }, 1000)
  }

  return (
    <AdminSidebar>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="mb-4">
          <Image src="/logogreen.png" alt="NestedHub Logo" width={200} height={60} />
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
  )
}
