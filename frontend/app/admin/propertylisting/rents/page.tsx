"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import AdminSidebar from "@/component/admin/sidebar"
import Pagination from "@/component/admin/pagination"

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
  {
    id: "03",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    status: "For rent",
    dateList: "04 Sep 2024",
  },
  {
    id: "04",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    status: "For rent",
    dateList: "04 Sep 2024",
  },
  {
    id: "05",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    status: "For rent",
    dateList: "04 Sep 2024",
  },
]

export default function RentalPropertiesPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter properties based on search term
  const filteredProperties = mockRentalProperties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (id: string) => {
    router.push(`/admin/property-listing/rent/edit/${id}`)
  }

  const handleDelete = (id: string) => {
    console.log(`Delete property with ID: ${id}`)
    // In a real app, you would call an API to delete the property
  }

  const handleView = (id: string) => {
    router.push(`/admin/property-listing/rent/${id}`)
  }

  return (
    <AdminSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-6">Rental Properties</h1>

        <div className="mb-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pl-10"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-md shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
              {filteredProperties.map((property) => (
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
                        onClick={() => handleEdit(property.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleView(property.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
      </div>
    </AdminSidebar>
  )
}
