"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import AdminSidebar from "@/component/admin/sidebar"
import BackButton from "@/component/ui/backbutton"

// Mock data for a user
const mockUserDetail = {
  name: "Song Lyna",
  email: "song@gmail.com",
  phone: "0987654321",
}

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string

  const user = mockUserDetail

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton className="mr-4" />
          <h1 className="text-2xl font-bold">User Detail</h1>
        </div>

        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50 w-1/4">
                  <span className="text-sm font-medium text-gray-900">Title</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">Detail</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">Name</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{user.name}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">Profile</span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden">
                    <Image
                      src="/avatar-placeholder.png"
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">Email</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{user.email}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">Phone</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{user.phone}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminSidebar>
  )
}
