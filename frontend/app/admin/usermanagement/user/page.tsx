"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Trash2 } from "lucide-react"
import AdminSidebar from "@/component/admin/sidebar"
import Pagination from "@/component/admin/pagination"

// Mock data for users
const mockUsers = [
  {
    id: "1",
    name: "Song Lyna",
    phone: "0987654321",
    email: "song@gmail.com",
  },
  {
    id: "2",
    name: "Song Lyna",
    phone: "0987654321",
    email: "song@gmail.com",
  },
  {
    id: "3",
    name: "Song Lyna",
    phone: "0987654321",
    email: "song@gmail.com",
  },
  {
    id: "4",
    name: "Song Lyna",
    phone: "0987654321",
    email: "song@gmail.com",
  },
  {
    id: "5",
    name: "Song Lyna",
    phone: "0987654321",
    email: "song@gmail.com",
  },
  {
    id: "6",
    name: "Song Lyna",
    phone: "0987654321",
    email: "song@gmail.com",
  },
]

export default function UserManagementPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    console.log(`Delete user with ID: ${id}`)
    // In a real app, you would call an API to delete the user
  }

  const handleView = (id: string) => {
    router.push(`/admin/user-management/user/${id}`)
  }

  return (
    <AdminSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-6">Customer Management</h1>

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
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleView(user.id)}
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
