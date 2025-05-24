"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import AdminSidebar from "@/component/admin/sidebar"
import BackButton from "@/component/ui/backbutton"

// Mock data for a property owner request
const mockPropertyOwnerDetail = {
  name: "Song Lyna",
  email: "song@gmail.com",
  phone: "0987654321",
  telegram: "None",
  idCard: "/placeholder.svg?height=200&width=300",
}

export default function PropertyOwnerRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  // In a real app, you would fetch the property owner request data based on the ID
  const propertyOwner = mockPropertyOwnerDetail

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton className="mr-4" />
          <h1 className="text-2xl font-bold">Property owner Detail</h1>
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
                  <span className="text-sm text-gray-500">{propertyOwner.name}</span>
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
                  <span className="text-sm text-gray-500">{propertyOwner.email}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">Phone</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{propertyOwner.phone}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">Telegram</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{propertyOwner.telegram}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">ID Card</span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-40 w-64 bg-gray-200 rounded-md flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminSidebar>
  )
}
