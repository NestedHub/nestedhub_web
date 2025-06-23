"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Trash2, Ban, Edit } from "lucide-react";
import AdminSidebar from "@/component/admin/sidebar";
import Pagination from "@/component/admin/pagination";
import { adminApi, type User } from "@/lib/api/admin";
import { toast } from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  console.log("Component Render: UserManagementPage");
  console.log("Current State:", {
    currentPage,
    searchTerm,
    debouncedSearchTerm,
    isLoading,
    totalCount,
    totalPages,
    usersLength: users.length,
  });

  // Debounce search term
  useEffect(() => {
    console.log("useEffect: Debouncing searchTerm:", searchTerm);
    const timer = setTimeout(() => {
      console.log("Debounce Timer Fired: Setting debouncedSearchTerm to:", searchTerm);
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    return () => {
      console.log("Debounce Timer Cleared");
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Fetch users with search and pagination
  const fetchUsers = async () => {
    console.log("Function Call: fetchUsers initiated.");
    console.log("fetchUsers - current debouncedSearchTerm:", debouncedSearchTerm);
    console.log("fetchUsers - current currentPage:", currentPage);

    try {
      setIsLoading(true);
      const searchParams = {
        role: "customer" as const,
        name: debouncedSearchTerm || undefined,
      };
      console.log("fetchUsers - searchParams for count:", searchParams);

      // Get total count
      const countResponse = await adminApi.getUserCount(searchParams);
      console.log("fetchUsers - getUserCount response:", countResponse);

      if (countResponse && typeof countResponse.total === 'number') {
        setTotalCount(countResponse.total);
        setTotalPages(Math.ceil(countResponse.total / ITEMS_PER_PAGE));
        console.log("fetchUsers - Total Count Set:", countResponse.total);
        console.log("fetchUsers - Total Pages Set:", Math.ceil(countResponse.total / ITEMS_PER_PAGE));
      } else {
        console.warn("fetchUsers - getUserCount did not return a valid total:", countResponse);
        setTotalCount(0);
        setTotalPages(1);
      }


      // Get paginated results
      const listUsersParams = {
        ...searchParams,
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      };
      console.log("fetchUsers - listUsersParams:", listUsersParams);

      const response = await adminApi.listUsers(listUsersParams);
      console.log("fetchUsers - listUsers response:", response);

      if (Array.isArray(response)) {
        setUsers(response);
        console.log("fetchUsers - Users Set. Number of users:", response.length);
      } else {
        console.warn("fetchUsers - listUsers did not return an array:", response);
        setUsers([]); // Ensure users is an array even on unexpected response
      }

    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
      console.log("fetchUsers - setIsLoading(false)");
    }
  };

  useEffect(() => {
    console.log("useEffect: Fetching users due to currentPage or debouncedSearchTerm change.");
    fetchUsers();
  }, [currentPage, debouncedSearchTerm]);

  const handleDelete = async (userId: number) => {
    console.log("handleDelete called for userId:", userId);
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      console.log("Delete cancelled by user.");
      return;
    }

    try {
      await adminApi.deleteUser(userId, true); // Pass true for hard delete
      toast.success("User deleted successfully");
      console.log("User deleted successfully:", userId);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleBanToggle = async (userId: number, currentlyActive: boolean) => {
    console.log("handleBanToggle called for userId:", userId, "currentlyActive:", currentlyActive);
    try {
      await adminApi.toggleUserBan(userId, currentlyActive);
      toast.success(
        currentlyActive
          ? "User banned successfully"
          : "User unbanned successfully"
      );
      console.log("User ban/unban successful for userId:", userId, "New status:", !currentlyActive);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error toggling user ban:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleView = (userId: number) => {
    console.log("handleView called for userId:", userId);
    router.push(`/admin/usermanagement/user/${userId}`);
  };

  const handleEdit = (userId: number) => {
    console.log("handleEdit called for userId:", userId);
    router.push(`/admin/usermanagement/user/${userId}/edit`);
  };

  console.log("process.env.NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL); // <-- Add this line

  return (
    <AdminSidebar>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <div className="text-sm text-gray-500">
            Total Customers: {totalCount}
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No users found
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
                      {user.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(user.user_id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleBanToggle(user.user_id, user.is_active)
                          }
                          className={`${
                            user.is_active
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={user.is_active ? "Ban User" : "Unban User"}
                        >
                          <Ban size={18} />
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
}

// adminApi and related types remain unchanged
// ... (your adminApi.ts content)