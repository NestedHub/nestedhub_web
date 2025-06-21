"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Sidebar from "@/component/dashoboadpropertyowner/sidebar";
import { propertyOwnerApi } from "@/lib/api/propertyOwner";
import { Card } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Badge } from "@/component/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/component/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Home, Check, X, MessageSquare, Eye } from "lucide-react";
import { format } from "date-fns";

interface ViewingRequest {
  request_id: number | string;
  user_id: number | string;
  property_id: number | string;
  requested_time: string;
  status: 'pending' | 'accepted' | 'denied';
  created_at: string;
  message?: string;
}

interface User {
  user_id: number | string;
  name: string;
  email: string;
  profile_picture_url?: string;
}

interface Property {
  property_id: number | string;
  title: string;
  address: string;
  description?: string;
}

interface ViewingRequestWithDetails extends ViewingRequest {
  user?: User;
  property?: Property;
}

// Local storage for denial reasons (since backend doesn't support it)
interface DenialReason {
  requestId: number;
  reason: string;
  deniedAt: string;
}

export default function BookingManagementPage() {
  const [viewingRequests, setViewingRequests] = useState<ViewingRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'denied'>('all');
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ViewingRequestWithDetails | null>(null);
  const [denialReason, setDenialReason] = useState("");
  const [denialReasons, setDenialReasons] = useState<DenialReason[]>([]);

  useEffect(() => {
    fetchViewingRequests();
    loadDenialReasons();
  }, []);

  const loadDenialReasons = () => {
    try {
      const stored = localStorage.getItem('denialReasons');
      if (stored) {
        setDenialReasons(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading denial reasons:', error);
    }
  };

  const saveDenialReason = (requestId: number, reason: string) => {
    try {
      const newReason: DenialReason = {
        requestId,
        reason,
        deniedAt: new Date().toISOString()
      };
      const updatedReasons = [...denialReasons, newReason];
      setDenialReasons(updatedReasons);
      localStorage.setItem('denialReasons', JSON.stringify(updatedReasons));
    } catch (error) {
      console.error('Error saving denial reason:', error);
    }
  };

  const getDenialReason = (requestId: number): DenialReason | undefined => {
    return denialReasons.find(r => r.requestId === requestId);
  };

  // Fetch user details by ID
  const fetchUserDetails = async (userId: number): Promise<User | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        {
          headers: await propertyOwnerApi.getAuthHeaders(),
          credentials: 'include',
        }
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
    return null;
  };

  // Fetch property details by ID
  const fetchPropertyDetails = async (propertyId: number): Promise<Property | null> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`,
        {
          headers: await propertyOwnerApi.getAuthHeaders(),
          credentials: 'include',
        }
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
    }
    return null;
  };

  const fetchViewingRequests = async () => {
    try {
      setLoading(true);
      const requests = await propertyOwnerApi.getOwnerViewingRequests();
      
      // Fetch user and property details for each request
      const requestsWithDetails = await Promise.all(
        requests.map(async (request: ViewingRequest) => {
          const [user, property] = await Promise.all([
            fetchUserDetails(Number(request.user_id)),
            fetchPropertyDetails(Number(request.property_id))
          ]);
          
          return {
            ...request,
            user: user || undefined,
            property: property || undefined
          };
        })
      );
      
      setViewingRequests(requestsWithDetails);
    } catch (error) {
      console.error('Error fetching viewing requests:', error);
      toast.error('Failed to load viewing requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await propertyOwnerApi.acceptViewingRequest(requestId);
      toast.success('Viewing request accepted successfully');
      fetchViewingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept viewing request');
    }
  };

  const handleDenyRequest = async (requestId: number) => {
    if (!denialReason.trim()) {
      toast.error('Please provide a reason for denying this request');
      return;
    }

    try {
      await propertyOwnerApi.denyViewingRequest(requestId);
      saveDenialReason(requestId, denialReason.trim());
      toast.success('Viewing request denied successfully');
      setDenyDialogOpen(false);
      setDenialReason("");
      setSelectedRequest(null);
      fetchViewingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny viewing request');
    }
  };

  const openDenyDialog = (request: ViewingRequestWithDetails) => {
    setSelectedRequest(request);
    setDenialReason("");
    setDenyDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const filteredRequests = viewingRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const pendingCount = viewingRequests.filter(r => r.status === 'pending').length;
  const acceptedCount = viewingRequests.filter(r => r.status === 'accepted').length;
  const deniedCount = viewingRequests.filter(r => r.status === 'denied').length;

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading viewing requests...</p>
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Management</h1>
          <p className="text-gray-600">Manage viewing requests from potential tenants</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{viewingRequests.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Denied</p>
                <p className="text-2xl font-bold text-gray-900">{deniedCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              { key: 'all', label: 'All Requests', count: viewingRequests.length },
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'accepted', label: 'Accepted', count: acceptedCount },
              { key: 'denied', label: 'Denied', count: deniedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No viewing requests</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any viewing requests yet."
                  : `No ${filter} viewing requests found.`
                }
              </p>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const denialReasonData = getDenialReason(Number(request.request_id));
              
              return (
                <Card key={request.request_id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {request.property?.title || `Property #${request.property_id}`}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {request.property?.address || 'Address not available'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{request.user?.name || `User #${request.user_id}`}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {format(new Date(String(request.requested_time)), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {format(new Date(String(request.requested_time)), "hh:mm a")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(request.status)}
                          <p className="text-xs text-gray-500">
                            Requested: {format(new Date(String(request.created_at)), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start">
                            <MessageSquare className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Message from tenant:</p>
                              <p className="text-sm text-gray-600">{request.message}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.status === 'denied' && denialReasonData && (
                        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-start">
                            <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-1">Denial reason:</p>
                              <p className="text-sm text-red-600">{denialReasonData.reason}</p>
                              <p className="text-xs text-red-500 mt-1">
                                Denied on: {format(new Date(String(denialReasonData.deniedAt)), "MMM dd, yyyy 'at' hh:mm a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-2 mt-4 lg:mt-0 lg:ml-4">
                        <Button
                          onClick={() => handleAcceptRequest(Number(request.request_id))}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => openDenyDialog(request)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Deny Dialog */}
        <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Deny Viewing Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please provide a reason for denying this viewing request. This will help the tenant understand your decision.
              </p>
              <div>
                <label htmlFor="denial-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for denial *
                </label>
                <Textarea
                  id="denial-reason"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="Enter the reason for denying this viewing request..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDenyDialogOpen(false);
                  setDenialReason("");
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedRequest && handleDenyRequest(Number(selectedRequest.request_id))}
                disabled={!denialReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Deny Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  );
} 