"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye } from "lucide-react"
import AdminSidebar from "@/component/admin/sidebar"
import Pagination from "@/component/admin/pagination"

// Mock data for property requests
const mockPropertyRequests = [
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

export default function PropertyRequestPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter property requests based on search term
  const filteredRequests = mockPropertyRequests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAccept = (id: string) => {
    console.log(`Accepted property request with ID: ${id}`)
    // In a real app, you would call an API to accept the request
  }

  const handleReject = (id: string) => {
    console.log(`Rejected property request with ID: ${id}`)
    // In a real app, you would call an API to reject the request
  }

  const handleView = (id: string) => {
    router.push(`/admin/property-listing/property-request/${id}`)
  }

  return (
    <AdminSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-6">Property Request</h1>

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
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.dateList}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleView(request.id)}
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
