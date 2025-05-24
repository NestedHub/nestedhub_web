"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

// Mock data for properties
const mockProperties = [
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
  {
    id: "06",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    status: "For rent",
    dateList: "04 Sep 2024",
  },
  {
    id: "07",
    title: "Luxury Apartment in Downtown",
    type: "Apartment",
    status: "For rent",
    dateList: "04 Sep 2024",
  },
]

export default function PropertyTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter properties based on search term
  const filteredProperties = mockProperties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProperties.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)

  const handleViewDetails = (id: string) => {
    router.push(`/propertyowner/property/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/propertyowner/property/edit/${id}`)
  }

  const handleDelete = (id: string) => {
    // In a real app, you would call an API to delete the property
    alert(`Delete property with ID: ${id}`)
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pl-8"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-2.5 top-3 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          onClick={() => router.push("/propertyowner/property/create")}
          className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Create Property
        </button>
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
            {currentItems.map((property) => (
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
                      onClick={() => handleViewDetails(property.id)}
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

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Show rows:
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="ml-2 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={10}>10 items</option>
            <option value={20}>20 items</option>
            <option value={50}>50 items</option>
          </select>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded-md ${
              currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded-md ${
                currentPage === number ? "bg-green-800 text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {number}
            </button>
          ))}

          {totalPages > 3 && (
            <>
              <span className="px-2 py-1">...</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages ? "bg-green-800 text-white" : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 rounded-md ${
              currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
