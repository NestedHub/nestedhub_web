// app/user/viewing-requests/page.tsx
"use client";

import { useState, useMemo } from "react";
import {
  useUserUpcomingViewingRequests,
  useUserViewingRequests,
} from "@/lib/hooks/useViewingRequests";
import { ViewingRequestResponse } from "@/lib/api/viewingrequest";
import { CalendarCheck, Loader2, Info, XCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useProperty } from "@/lib/hooks/useProperty"; // Import the useProperty hook

type Tab = "upcoming" | "pending" | "all";

// --- New Component: ViewingRequestCard ---
interface ViewingRequestCardProps {
  request: ViewingRequestResponse;
}

const ViewingRequestCard: React.FC<ViewingRequestCardProps> = ({ request }) => {
  // Use the useProperty hook to fetch property details for this request
  const { property, isLoading, error } = useProperty(String(request.property_id)); // property_id is number, useProperty expects string

  const statusColor =
    request.status === "accepted"
      ? "text-green-600"
      : request.status === "pending"
      ? "text-yellow-600"
      : "text-red-600";

  const statusIcon =
    request.status === "accepted" ? (
      <CheckCircle className="h-5 w-5 mr-1" />
    ) : request.status === "pending" ? (
      <Info className="h-5 w-5 mr-1" />
    ) : (
      <XCircle className="h-5 w-5 mr-1" />
    );

  // Parse requested_time for display
  const requestedDateTime = new Date(request.requested_time);
  const preferredDate = format(requestedDateTime, "PPP"); // e.g., Jun 19th, 2025
  const preferredTimeSlot = format(requestedDateTime, "p"); // e.g., 7:30 PM

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 text-green-700 animate-spin" />
        <span className="ml-2 text-gray-600">Loading property...</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-red-200 text-red-700 h-40 flex items-center justify-center">
        <XCircle className="h-6 w-6 mr-2" />
        <span>Failed to load property details.</span>
      </div>
    );
  }

  return (
    <div
      key={request.request_id}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Request for:{" "}
        <span className="text-green-700">{property.title}</span> {/* Use property.title */}
      </h3>
      <p className="text-gray-600 mb-1">
        <span className="font-medium">Property ID:</span> {request.property_id} {/* Use request.property_id */}
      </p>
      <p className="text-gray-600 mb-1">
        <span className="font-medium">Requested Date:</span>{" "}
        {preferredDate}
      </p>
      <p className="text-gray-600 mb-1">
        <span className="font-medium">Time Slot:</span> {preferredTimeSlot}
      </p>
      <p className={`flex items-center text-md font-semibold mt-3 ${statusColor}`}>
        {statusIcon}
        Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Created On: {format(new Date(request.created_at), "PPpp")}
      </p>
      {request.message && (
        <p className="text-gray-700 italic mt-3 border-t pt-3 text-sm">
          "{request.message}"
        </p>
      )}
    </div>
  );
};

// --- Main Page Component ---
export default function ViewingRequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  // This hook already specifically fetches upcoming (accepted and in future) requests
  const {
    data: upcomingAcceptedRequests, // Renamed for clarity
    loading: loadingUpcoming,
    error: errorUpcoming,
  } = useUserUpcomingViewingRequests();

  // This hook fetches all requests
  const {
    data: allRequests,
    loading: loadingAll,
    error: errorAll,
  } = useUserViewingRequests();

  // Memoize pending requests from the 'allRequests' list
  const pendingRequests = useMemo(() => {
    return allRequests.filter((request) => request.status === "pending");
  }, [allRequests]);

  // Memoize all requests, sorted for 'All History'
  const sortedAllRequests = useMemo(() => {
    // Sort all requests by creation date, newest first
    return [...allRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allRequests]);

  const renderContent = () => {
    if (loadingUpcoming || loadingAll) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-green-700 animate-spin" />
          <p className="ml-3 text-lg text-gray-600">Loading viewing requests...</p>
        </div>
      );
    }

    if (errorUpcoming || errorAll) {
      return (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <XCircle className="h-10 w-10 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Requests</h2>
          <p>Failed to load your viewing requests. Please try again later.</p>
          {(errorUpcoming || errorAll) && (
            <p className="text-sm mt-2 text-red-500">
              Details: {(errorUpcoming || errorAll)?.message}
            </p>
          )}
        </div>
      );
    }

    let requestsToDisplay: ViewingRequestResponse[] = [];
    let emptyMessageComponent;

    switch (activeTab) {
      case "upcoming":
        requestsToDisplay = upcomingAcceptedRequests; // Use the dedicated hook's data
        emptyMessageComponent = (
          <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
            <CalendarCheck className="h-10 w-10 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Upcoming Viewings</h2>
            <p>You currently have no confirmed upcoming viewing appointments.</p>
          </div>
        );
        break;
      case "pending":
        requestsToDisplay = pendingRequests; // Use the filtered pending list
        emptyMessageComponent = (
          <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            <Info className="h-10 w-10 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Pending Requests</h2>
            <p>You don't have any viewing requests awaiting confirmation at the moment.</p>
          </div>
        );
        break;
      case "all":
        requestsToDisplay = sortedAllRequests; // Use the sorted all history list
        emptyMessageComponent = (
          <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            <CalendarCheck className="h-10 w-10 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Viewing History</h2>
            <p>You haven't made any viewing requests yet.</p>
          </div>
        );
        break;
      default:
        return null;
    }

    if (requestsToDisplay.length === 0) {
      return emptyMessageComponent;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requestsToDisplay.map((request) => (
          <ViewingRequestCard key={request.request_id} request={request} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Your Viewing Requests
      </h1>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200
              ${
                activeTab === "upcoming"
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Upcoming
            {(loadingUpcoming || upcomingAcceptedRequests.length > 0) && ( // Use upcomingAcceptedRequests for count
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
                {loadingUpcoming ? <Loader2 className="h-3 w-3 animate-spin" /> : upcomingAcceptedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200
              ${
                activeTab === "pending"
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Pending
            {(loadingAll || pendingRequests.length > 0) && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-yellow-500 rounded-full">
                {loadingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200
              ${
                activeTab === "all"
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            All History
            {(loadingAll || allRequests.length > 0) && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-gray-500 rounded-full">
                {loadingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : allRequests.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
}