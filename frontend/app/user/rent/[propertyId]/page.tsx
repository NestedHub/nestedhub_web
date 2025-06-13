// app/user/property/[propertyId]/page.tsx
"use client";

import { useState, useEffect } from "react"; // Import useState and useEffect
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";
import { useProperty } from "@/lib/hooks/useProperty";
import { useReviews } from "@/lib/hooks/useReviews";
import { useUserDetail } from "@/lib/hooks/useUserDetail"; // Keep this if you still need it for the property owner
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import { Loader2, Heart } from "lucide-react"; // Import Heart and Loader2 icons

// Import wishlist-related hooks/utils
import { useUser } from "@/lib/hooks/useUser"; // IMPORTANT: Import useUser hook
import { getUserWishlist, addPropertyToWishlist, removePropertyFromWishlist } from "@/lib/utils/wishlist-api";
import { WishListResponse } from "@/lib/types"; // Ensure you have this type defined

// Import modularized components
import { PropertyImageGallery } from "@/component/user/property-detail/PropertyImageGallery";
import { PropertyDetailsSection } from "@/component/user/property-detail/PropertyDetailsSection";
import { PropertyDescription } from "@/component/user/property-detail/PropertyDescription";
import { PropertyOverviewTable } from "@/component/user/property-detail/PropertyOverviewTable";
import { PropertyFeaturesBadges } from "@/component/user/property-detail/PropertyFeaturesBadges";
import { PropertyLocationMap } from "@/component/user/property-detail/PropertyLocationMap";
import { PropertyReviewsSection } from "@/component/user/property-detail/PropertyReviewsSection";
import { BookingFormCard } from "@/component/user/property-detail/BookingFormCard";
import { RelatedPropertiesSection } from "@/component/user/property-detail/RelatedPropertiesSection";


export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter(); // Initialize router
  const propertyId = typeof params.propertyId === 'string' ? params.propertyId : '';

  // Use the useUser hook for authentication status
  const { user, isAuthenticated, isLoading: isUserLoading } = useUser();

  const { property, isLoading, error } = useProperty(propertyId);
  const { reviews, isLoadingReviews, errorReviews } = useReviews(propertyId);

  const { user: owner } = useUserDetail(property?.user_id);

  // State for the wishlist status of THIS specific property
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlistStatus, setLoadingWishlistStatus] = useState(true);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false); // To prevent multiple clicks

  // --- Effect to fetch initial wishlist status for the current property ---
  useEffect(() => {
    // Only proceed if propertyId is available and user loading is complete
    if (!propertyId || isUserLoading) {
      return;
    }

    const checkWishlistStatus = async () => {
      setLoadingWishlistStatus(true);
      try {
        if (isAuthenticated) {
          // Fetch the entire user wishlist
          const wishlist = await getUserWishlist();
          // Check if the current property is in the fetched wishlist
          const currentPropertyIsWishlisted = (wishlist ?? []).some(
            (item: WishListResponse) => item.property_id === parseInt(propertyId)
          );
          setIsWishlisted(currentPropertyIsWishlisted);
        } else {
          setIsWishlisted(false); // If not authenticated, it's not wishlisted
        }
      } catch (err) {
        console.error("Failed to fetch user wishlist for this property:", err);
        setIsWishlisted(false); // Assume not wishlisted on error
      } finally {
        setLoadingWishlistStatus(false);
      }
    };

    checkWishlistStatus();
  }, [propertyId, isAuthenticated, isUserLoading]); // Re-run if propertyId or user auth status changes

  // --- Handler to toggle wishlist status ---
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add properties to your wishlist.");
      router.push("/user/login"); // Redirect to login
      return;
    }

    if (isTogglingWishlist) return; // Prevent multiple clicks

    setIsTogglingWishlist(true); // Disable button during API call
    const previousWishlistedState = isWishlisted;
    setIsWishlisted(!previousWishlistedState); // Optimistic UI update

    try {
      if (!previousWishlistedState) {
        await addPropertyToWishlist(parseInt(propertyId));
        console.log(`Successfully added property ${propertyId} to wishlist.`);
      } else {
        await removePropertyFromWishlist(parseInt(propertyId));
        console.log(`Successfully removed property ${propertyId} from wishlist.`);
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setIsWishlisted(previousWishlistedState); // Revert UI on error
      alert("Failed to update wishlist. Please try again.");
    } finally {
      setIsTogglingWishlist(false); // Re-enable button
    }
  };


  const overallLoading = isLoading || isUserLoading || loadingWishlistStatus;
  // Disable button if any data is loading, or if the wishlist toggle is in progress, or if not authenticated
  const isWishlistButtonDisabled = overallLoading || isTogglingWishlist || !isAuthenticated;


  if (overallLoading) { // Combined loading state
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
        <p className="text-gray-700 text-lg">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg font-semibold mb-2">Error: {error}</p>
        <p className="text-gray-600">Could not load property details. Please try again later.</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-700 text-lg">Property not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <PropertyImageGallery
              title={property.title}
              media={property.media
                .filter((item) => item.url !== null)
                .map((item) => ({
                  ...item,
                  url: item.url as string
                }))}
            />
            {/* The wishlist button will be placed here or within PropertyDetailsSection */}
            <div className="flex items-center justify-between mb-4"> {/* Added a div for flexible placement */}
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              {/* --- WISHLIST BUTTON START --- */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-full shadow-md transition-colors duration-200 ${
                  isWishlistButtonDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-50"
                }`}
                disabled={isWishlistButtonDisabled}
                title={isWishlistButtonDisabled ?
                  (isAuthenticated ? "Loading..." : "Login to add to wishlist")
                  : (isWishlisted ? "Remove from wishlist" : "Add to wishlist")
                }
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isTogglingWishlist ? (
                  <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
                ) : (
                  <Heart
                    className={`h-6 w-6 ${
                      isWishlisted && !isWishlistButtonDisabled ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                )}
              </button>
              {/* --- WISHLIST BUTTON END --- */}
            </div>

            {/* Pass isUserAuthenticated and isUserLoading to PropertyDetailsSection if it renders the owner's contact, etc. */}
            <PropertyDetailsSection property={property} owner={owner ?? undefined} />
            <PropertyDescription description={property.description} />
            <PropertyOverviewTable property={property} />
            <PropertyFeaturesBadges features={property.features} />
            <PropertyLocationMap location={property.location} />
            <PropertyReviewsSection
              reviews={reviews}
              isLoadingReviews={isLoadingReviews}
              errorReviews={errorReviews}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <BookingFormCard propertyId={String(property.property_id)} />
            <div className="hidden lg:block"></div>
          </div>
        </div>

        <RelatedPropertiesSection />
      </main>

      <Footer />
    </div>
  );
}