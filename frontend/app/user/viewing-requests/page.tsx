// app/user/viewing-requests/page.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useUserUpcomingViewingRequests,
  useUserViewingRequests,
} from "@/lib/hooks/useViewingRequests";
import { ViewingRequestResponse } from "@/lib/api/viewingrequest";
import {
  CalendarCheck,
  Loader2,
  Info,
  XCircle,
  CheckCircle,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  SearchX, // Added for no results icon
} from "lucide-react";
import { format } from "date-fns";
import { useProperty } from "@/lib/hooks/useProperty";
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";

type Tab = "upcoming" | "pending" | "all";

// --- New Component: ViewingRequestCard ---
interface ViewingRequestCardProps {
  request: ViewingRequestResponse;
}

const ViewingRequestCard: React.FC<ViewingRequestCardProps> = ({ request }) => {
  const { property, isLoading, error } = useProperty(
    String(request.property_id)
  );

  const statusColor = useMemo(() => {
    switch (request.status) {
      case "accepted":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "denied":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50"; // Fallback for unknown statuses
    }
  }, [request.status]);

  const statusIcon = useMemo(() => {
    switch (request.status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 mr-1" />;
      case "pending":
        return <Info className="h-5 w-5 mr-1" />;
      case "denied":
        return <XCircle className="h-5 w-5 mr-1" />;
      default:
        return null;
    }
  }, [request.status]);

  const requestedDateTime = new Date(request.requested_time);
  const preferredDate = format(requestedDateTime, "PPP");
  const preferredTimeSlot = format(requestedDateTime, "p");

  // Determine the main image URL
  const mainImageUrl = useMemo(() => {
    if (property && property.media && property.media.length > 0) {
      // If there's any media, just take the first one
      return property.media[0].media_url;
    }
    return "/placeholder-property.jpg"; // Default placeholder if no image available
  }, [property]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center min-h-[220px] w-full">
        <Loader2 className="h-8 w-8 text-green-700 animate-spin" />
        <span className="ml-3 text-lg text-gray-600">Loading property...</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl shadow-lg border border-red-200 text-red-700 min-h-[220px] w-full flex flex-col items-center justify-center">
        <XCircle className="h-8 w-8 mb-3" />
        <span className="text-lg font-medium">Failed to load property details.</span>
        {error && (
          <p className="text-sm mt-1 text-red-500">
            {typeof error === "string"
              ? error
              : error && typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : "An unknown error occurred."}
          </p>
        )}
      </div>
    );
  }

  const propertyDetailPageUrl = `/user/rent/${property.property_id}`;

  return (
    <div
      key={request.request_id}
      className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 w-full flex flex-col sm:flex-row items-start"
    >
      {/* Image Section (Left) */}
      <div className="flex-shrink-0 w-full sm:w-64 h-48 md:w-72 md:h-56 lg:w-80 lg:h-64 rounded-xl overflow-hidden relative mb-4 sm:mb-0 sm:mr-4">
        <Image
          src={mainImageUrl}
          alt={property.title || "Property image"}
          layout="fill"
          objectFit="cover"
          className="rounded-xl"
        />
      </div>

      {/* Content Section (Right) */}
      <div className="flex-grow pl-0 sm:pl-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Request for:{" "}
          <Link
            href={propertyDetailPageUrl}
            className="text-green-700 hover:underline"
          >
            {property.title}
          </Link>
        </h3>
        {/* Essential Property Details */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 text-base mb-4">
          {property.category_name && (
            <p className="flex items-center">
              <span className="font-medium mr-1">Category:</span>{" "}
              {property.category_name}
            </p>
          )}
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <p className="flex items-center">
              <Bed className="h-5 w-5 mr-1 text-gray-500" />
              <span className="font-medium">{property.bedrooms} Beds</span>
            </p>
          )}
          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <p className="flex items-center">
              <Bath className="h-5 w-5 mr-1 text-gray-500" />
              <span className="font-medium">{property.bathrooms} Baths</span>
            </p>
          )}
          {property.floor_area !== undefined &&
            property.floor_area !== null && (
              <p className="flex items-center">
                <Ruler className="h-5 w-5 mr-1 text-gray-500" />
                <span className="font-medium">{property.floor_area} m²</span>
              </p>
            )}
          {property.pricing?.rent_price && (
            <p className="flex items-center">
              <DollarSign className="h-5 w-5 mr-1 text-gray-500" />
              <span className="font-medium">
                ${property.pricing.rent_price.toLocaleString()} / month
              </span>
            </p>
          )}
        </div>

        {/* Viewing Request Specific Details */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-gray-700 mb-2 text-base">
            <span className="font-semibold">Requested Date:</span>{" "}
            {preferredDate}
          </p>
          <p className="text-gray-700 mb-2 text-base">
            <span className="font-semibold">Time Slot:</span>{" "}
            {preferredTimeSlot}
          </p>
          <p
            className={`flex items-center text-lg font-bold px-3 py-1 rounded-full w-fit ${statusColor}`}
          >
            {statusIcon}
            Status:{" "}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </p>
          <p className="text-gray-500 text-sm mt-3">
            Created On: {format(new Date(request.created_at), "PPpp")}
          </p>
          {request.message && (
            <p className="text-gray-700 italic mt-4 border-t border-gray-100 pt-4 text-base">
              <span className="font-semibold">Your Message:</span> "
              {request.message}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function ViewingRequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const {
    data: rawUpcomingRequests,
    loading: loadingUpcoming,
    error: errorUpcoming,
  } = useUserUpcomingViewingRequests();

  const upcomingAcceptedRequests = useMemo(() => {
    const now = new Date();
    return rawUpcomingRequests.filter(
      (request) =>
        request.status === "accepted" && new Date(request.requested_time) > now
    );
  }, [rawUpcomingRequests]);

  const {
    data: allRequests,
    loading: loadingAll,
    error: errorAll,
  } = useUserViewingRequests();

  const pendingRequests = useMemo(() => {
    return allRequests.filter((request) => request.status === "pending");
  }, [allRequests]);

  const sortedAllRequests = useMemo(() => {
    return [...allRequests].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allRequests]);

  const renderContent = () => {
    if (loadingUpcoming || loadingAll) {
      return (
        <div className="flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4" />
          <p className="text-gray-600 text-lg">Loading viewing requests...</p>
        </div>
      );
    }

    if (errorUpcoming || errorAll) {
      return (
        <div className="text-center p-12 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-lg">
          <XCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
          <h2 className="text-2xl font-bold mb-3">Error Loading Requests</h2>
          <p className="text-lg max-w-md mx-auto">
            Failed to load your viewing requests. Please try again later.
          </p>
          {(errorUpcoming || errorAll) && (
            <p className="text-sm mt-3 text-red-500">
              Details: {(errorUpcoming || errorAll)?.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()} // Simple reload to retry
            className="mt-6 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      );
    }

    let requestsToDisplay: ViewingRequestResponse[] = [];
    let emptyMessageComponent;

    switch (activeTab) {
      case "upcoming":
        requestsToDisplay = upcomingAcceptedRequests;
        emptyMessageComponent = (
          <div className="text-center p-12 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 shadow-lg">
            <CalendarCheck className="h-16 w-16 mx-auto mb-6 text-blue-500" />
            <h2 className="text-2xl font-bold mb-3">No Upcoming Viewings</h2>
            <p className="text-lg max-w-md mx-auto">
              You currently have no confirmed upcoming viewing appointments.
            </p>
            <Link
              href="/user/rent"
              className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl transition-colors font-medium"
            >
              Browse Properties
            </Link>
          </div>
        );
        break;
      case "pending":
        requestsToDisplay = pendingRequests;
        emptyMessageComponent = (
          <div className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-700 shadow-lg">
            <Info className="h-16 w-16 mx-auto mb-6 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-3">No Pending Requests</h2>
            <p className="text-lg max-w-md mx-auto">
              You don't have any viewing requests awaiting confirmation at the
              moment.
            </p>
            <Link
              href="/user/rent"
              className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl transition-colors font-medium"
            >
              Request a Viewing
            </Link>
          </div>
        );
        break;
      case "all":
        requestsToDisplay = sortedAllRequests;
        emptyMessageComponent = (
          <div className="text-center p-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 shadow-lg">
            <SearchX className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold mb-3">No Viewing History</h2>
            <p className="text-lg max-w-md mx-auto">
              You haven't made any viewing requests yet. Start exploring properties!
            </p>
            <Link
              href="/user/rent"
              className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl transition-colors font-medium"
            >
              Find Your Next Home
            </Link>
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
      <div className="flex flex-col space-y-6">
        {requestsToDisplay.map((request) => (
          <ViewingRequestCard key={request.request_id} request={request} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
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
              {(loadingUpcoming || upcomingAcceptedRequests.length > 0) && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-green-500 rounded-full">
                  {loadingUpcoming ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    upcomingAcceptedRequests.length
                  )}
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
                  {loadingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    pendingRequests.length
                  )}
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
                  {loadingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    allRequests.length
                  )}
                </span>
              )}
            </button>
          </nav>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
}