"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import AdminSidebar from '@/component/admin/sidebar'
import BackButton from '@/component/ui/backbutton'
import { userApi, type User } from '@/lib/api/user'
import { toast } from 'react-hot-toast'

export default function PropertyOwnerRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = parseInt(params.id as string, 10)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        const userData = await userApi.getUser(userId)
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Failed to fetch user details')
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  const handleApprove = async () => {
    try {
      await userApi.approvePropertyOwner(userId)
      toast.success('Property owner approved successfully')
      router.push('/admin/usermanagement/property-owner-request')
    } catch (error) {
      console.error('Error approving property owner:', error)
      toast.error('Failed to approve property owner')
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return

    try {
      await userApi.rejectPropertyOwner(userId)
      toast.success('Property owner rejected successfully')
      router.push('/admin/usermanagement/property-owner-request')
    } catch (error) {
      console.error('Error rejecting property owner:', error)
      toast.error('Failed to reject property owner')
    }
  }

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminSidebar>
    )
  }

  if (!user) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Property owner not found</div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton className="mr-4" />
          <h1 className="text-2xl font-bold">Property Owner Detail</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
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
                  <span className="text-sm font-medium text-gray-900">Profile Picture</span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden">
                    <Image
                      src={user.profile_picture_url || '/avatar-placeholder.png'}
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
                  <span className="text-sm text-gray-500">{user.phone || 'N/A'}</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">ID Card</span>
                </td>
                <td className="px-6 py-4">
                  {user.id_card_url ? (
                    <Image
                      src={user.id_card_url}
                      alt="ID Card"
                      width={300}
                      height={200}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">No ID card uploaded</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleApprove}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Reject
          </button>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Reject Property Owner</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  disabled={!rejectReason.trim()}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  )
}
