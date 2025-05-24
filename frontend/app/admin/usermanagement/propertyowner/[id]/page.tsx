"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import AdminSidebar from "@/component/admin/sidebar"
import BackButton from "@/component/ui/backbutton"

// Mock data for a property owner
const mockPropertyOwnerDetail = {
  name: "Song Lyne",
  email: "lyne@gmail.com",
  phone: "0987654321",
  telegram: "None",
}

// Mock data for rental properties
const mockRentalProperties = [
  {
    id: "01",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    status: "For rent",
    dateList: "04 Sep 2024",
  },
  {
    id: "02",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    status: "For rent",
    dateList: "04 Sep 2024",
  },
]

export default function PropertyOwnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ownerId = params.id as string
  const [showAllRentModal, setShowAllRentModal] = useState(false)

  // In a real app, you would fetch the property owner data based on the ID
  const propertyOwner = mockPropertyOwnerDetail

  const handleShowAllRent = () => {
    setShowAllRentModal(true)
  }

  const handleCloseModal = () => {
    setShowAllRentModal(false)
  }

  const handleViewProperty = (id: string) => {
    router.push(`/admin/property-listing/rent/${id}`)
    setShowAllRentModal(false) // Close the modal when navigating
  }

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton className="mr-4" />
          <h1 className="text-2xl font-bold">Property owner Detail</h1>
        </div>

        <div className="bg-white rounded-md shadow overflow-hidden mb-6">
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
                  <span className="text-sm font-medium text-gray-900">Rents</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={handleShowAllRent}
                    className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Show all rent
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for showing all rental properties */}
      {showAllRentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <h2 className="text-xl font-bold mb-4">All Rent</h2>

            <table className="min-w-full divide-y divide-gray-200 mb-6">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date List
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockRentalProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.dateList}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProperty(property.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  )
}
