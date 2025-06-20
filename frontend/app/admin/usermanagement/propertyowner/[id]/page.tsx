"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Ban, Check, X } from "lucide-react";
import AdminSidebar from "@/component/admin/sidebar";
import BackButton from "@/component/ui/backbutton";
import { userApi, type User } from "@/lib/api/user";

export default function PropertyOwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await userApi.getUser(userId);
        if (userData.role !== "property_owner") {
          throw new Error("Not a property owner");
        }
        setUser(userData);
      } catch (error) {
        console.error("Error fetching property owner:", error);
        toast.error("Failed to fetch property owner details");
        router.push("/admin/usermanagement/propertyowner"); // Redirect back to list on error
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, router]);

  const handleBanToggle = async () => {
    if (!user) return;

    try {
      await userApi.toggleUserBan(userId, user.is_active);
      toast.success(
        user.is_active
          ? "Property owner banned successfully"
          : "Property owner unbanned successfully"
      );
      // Refresh user data
      const updatedUser = await userApi.getUser(userId);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error toggling property owner ban:", error);
      toast.error("Failed to update property owner status");
    }
  };

  const handleApprove = async () => {
    if (!user) return;

    try {
      await userApi.approvePropertyOwner(userId);
      toast.success("Property owner approved successfully");
      // Refresh user data
      const updatedUser = await userApi.getUser(userId);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error approving property owner:", error);
      toast.error("Failed to approve property owner");
    }
  };

  const handleReject = async () => {
    if (!user) return;

    if (!confirm("Are you sure you want to reject this property owner?")) {
      return;
    }

    try {
      await userApi.rejectPropertyOwner(userId);
      toast.success("Property owner rejected successfully");
      router.push("/admin/usermanagement/propertyowner");
    } catch (error) {
      console.error("Error rejecting property owner:", error);
      toast.error("Failed to reject property owner");
    }
  };

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminSidebar>
    );
  }

  if (!user) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Property owner not found</div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton className="mr-4" />
          <h1 className="text-2xl font-bold">Property Owner Detail</h1>
        </div>

        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50 w-1/4">
                  <span className="text-sm font-medium text-gray-900">ID</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{user.user_id}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">
                    Name
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{user.name}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">
                    Profile Picture
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden">
                    <Image
                      src={
                        user.profile_picture_url || "/avatar-placeholder.png"
                      }
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
                  <span className="text-sm font-medium text-gray-900">
                    Email
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{user.email}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">
                    Phone
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {user.phone || "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">
                    Status
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Banned"}
                    </span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_approved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.is_approved ? "Approved" : "Pending Approval"}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">
                    Email Verified
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_email_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.is_email_verified ? "Verified" : "Not Verified"}
                  </span>
                </td>
              </tr>
              {user.id_card_url && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">
                      ID Card
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-40 w-64 relative">
                      <Image
                        src={user.id_card_url}
                        alt="ID Card"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex space-x-4">
          {!user.is_approved ? (
            <>
              <button
                onClick={handleApprove}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
            </>
          ) : (
            <button
              onClick={handleBanToggle}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                user.is_active
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <Ban className="h-4 w-4 mr-2" />
              {user.is_active ? "Ban Property Owner" : "Unban Property Owner"}
            </button>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}