"use client";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Eye, Check, X } from "lucide-react"
import AdminSidebar from "@/component/admin/sidebar"
import Pagination from "@/component/admin/pagination"
import { userApi, type User } from "@/lib/api/user"
import { toast } from "react-hot-toast"

const ITEMS_PER_PAGE = 10;

export default function PropertyOwnerRequestPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users with search and pagination
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      
      // Get all pending requests first to get accurate count
      const allPendingRequests = await userApi.listAllUsers({
        role: 'property_owner',
        name: debouncedSearchTerm || undefined,
        email: debouncedSearchTerm || undefined,
        is_approved: false,
      });

      // Filter to ensure we only get unapproved property owners
      const totalRequests = allPendingRequests.filter(user => 
        user.role === 'property_owner' && !user.is_approved
      );
      setTotalCount(totalRequests.length);
      setTotalPages(Math.ceil(totalRequests.length / ITEMS_PER_PAGE));

      // Then get paginated results
      const response = await userApi.listUsers({
        role: 'property_owner',
        name: debouncedSearchTerm || undefined,
        email: debouncedSearchTerm || undefined,
        is_approved: false,
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      });

      // Filter to ensure we only get unapproved property owners
      const pendingRequests = response.filter(user => 
        user.role === 'property_owner' && !user.is_approved
      );
      setUsers(pendingRequests);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch property owner requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearchTerm]);

  const handleApprove = async (userId: number) => {
    try {
      await userApi.approvePropertyOwner(userId);
      toast.success('Property owner approved successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error approving property owner:', error);
      toast.error('Failed to approve property owner');
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm('Are you sure you want to reject this property owner request?')) {
      return;
    }

    try {
      await userApi.rejectPropertyOwner(userId);
      toast.success('Property owner request rejected');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting property owner:', error);
      toast.error('Failed to reject property owner');
    }
  };

  const handleView = (userId: number) => {
    router.push(`/admin/usermanagement/property-owner-request/${userId}`);
  };

  return (
    <AdminSidebar>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Property Owner Requests</h1>
          <div className="text-sm text-gray-500">
            Total Requests: {totalCount}
          </div>
        </div>

        <div className="mb-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search by name or email..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No pending requests
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(user.user_id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(user.user_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => handleView(user.user_id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </AdminSidebar>
  );
  );
}
