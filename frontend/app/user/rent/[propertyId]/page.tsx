// app/user/property/[propertyId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";
import { useProperty } from "@/lib/hooks/useProperty";
import { useUserDetail } from "@/lib/hooks/useUserDetail";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Heart, X } from "lucide-react";

import { useUser } from "@/lib/hooks/useUser";
import {
  getUserWishlist,
  addPropertyToWishlist,
  removePropertyFromWishlist,
} from "@/lib/utils/wishlist-api";
import { WishListResponse } from "@/lib/types";

import { usePropertyData } from "@/lib/hooks/usePropertyData";

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
  const router = useRouter();
  const propertyId =
    typeof params.propertyId === "string" ? params.propertyId : "";
  const propertyIdAsNumber = propertyId ? parseInt(propertyId) : null;

  const { isAuthenticated, isLoading: isUserLoading } = useUser();
  const { property, isLoading, error } = useProperty(propertyId);
  const { user: owner } = useUserDetail(property?.user_id);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlistStatus, setLoadingWishlistStatus] = useState(true);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const relatedPropertyFilters = property
    ? {
        // category_id: property.category_id?.toString(),
        // city_id: property.location?.city_id?.toString(),
      }
    : {};

  const {
    properties: relatedProperties,
    isLoading: isLoadingRelated,
    error: errorRelated,
  } = usePropertyData(
    "",
    relatedPropertyFilters,
    0,
    5,
    !property
  );

  const filteredRelatedProperties = relatedProperties
    .filter((p) => p.id !== propertyId)
    .slice(0, 4);

  useEffect(() => {
    if (!propertyIdAsNumber || isUserLoading) {
      return;
    }

    const checkWishlistStatus = async () => {
      setLoadingWishlistStatus(true);
      try {
        if (isAuthenticated) {
          const wishlist = await getUserWishlist();
          const currentPropertyIsWishlisted = (wishlist ?? []).some(
            (item: WishListResponse) => item.property_id === propertyIdAsNumber
          );
          setIsWishlisted(currentPropertyIsWishlisted);
        } else {
          setIsWishlisted(false);
        }
      } catch (err) {
        console.error("Failed to fetch user wishlist for this property:", err);
        setIsWishlisted(false);
      } finally {
        setLoadingWishlistStatus(false);
      }
    };

    checkWishlistStatus();
  }, [propertyIdAsNumber, isAuthenticated, isUserLoading]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert("Please log in to add properties to your wishlist.");
      router.push("/user/login");
      return;
    }

    if (isTogglingWishlist || !propertyIdAsNumber) return;

    setIsTogglingWishlist(true);
    const previousWishlistedState = isWishlisted;
    setIsWishlisted(!previousWishlistedState);

    try {
      if (!previousWishlistedState) {
        await addPropertyToWishlist(propertyIdAsNumber);
        console.log(
          `Successfully added property ${propertyIdAsNumber} to wishlist.`
        );
      } else {
        await removePropertyFromWishlist(propertyIdAsNumber);
        console.log(
          `Successfully removed property ${propertyIdAsNumber} from wishlist.`
        );
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setIsWishlisted(previousWishlistedState);
      alert("Failed to update wishlist. Please try again.");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const overallLoading = isLoading || isUserLoading || loadingWishlistStatus;
  const isWishlistButtonDisabled =
    overallLoading || isTogglingWishlist || !isAuthenticated;

  if (overallLoading) {
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
        <p className="text-red-500 text-lg font-semibold mb-2">
          Error: {error}
        </p>
        <p className="text-gray-600">
          Could not load property details. Please try again later.
        </p>
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

  // Determine if the property is available for booking
  const isPropertyAvailable = property.status === 'available';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="lg:grid-cols-1 space-y-8">
          <PropertyImageGallery
            title={property.title}
            media={property.media
              .filter((item) => item.url !== null)
              .map((item) => ({
                ...item,
                url: item.url as string,
              }))}
          />
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {property.title}
            </h1>
            <button
              onClick={handleToggleWishlist}
              className={`p-3 rounded-full shadow-md transition-colors duration-200 ${
                isWishlistButtonDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
              disabled={isWishlistButtonDisabled}
              title={
                isWishlistButtonDisabled
                  ? isAuthenticated
                    ? "Loading..."
                    : "Login to add to wishlist"
                  : isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {isTogglingWishlist ? (
                <Loader2 className="h-6 w-6 text-green-500 animate-spin" />
              ) : (
                <Heart
                  className={`h-6 w-6 ${
                    isWishlisted && !isWishlistButtonDisabled
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  }`}
                />
              )}
            </button>
          </div>

          <PropertyDetailsSection
            property={property}
            owner={owner ?? undefined}
          />
          <PropertyDescription description={property.description} />
          <PropertyOverviewTable property={property} />
          <PropertyFeaturesBadges features={property.features} />

          <div className="mt-8">
            {isPropertyAvailable ? (
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
              >
                Check Availability & Book
              </button>
            ) : (
              <div className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg text-xl font-semibold text-center cursor-not-allowed shadow-md">
                Property Currently Rented
              </div>
            )}
          </div>

          <PropertyLocationMap location={property.location} />
          {propertyIdAsNumber && (
            <PropertyReviewsSection
              propertyId={propertyIdAsNumber}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>

        <RelatedPropertiesSection
          properties={filteredRelatedProperties}
          isLoading={isLoadingRelated}
          error={errorRelated}
          isUserAuthenticated={isAuthenticated}
          isUserLoading={isUserLoading}
        />
      </main>

      <Footer />

      {isBookingModalOpen && isPropertyAvailable && ( // Only open modal if property is available
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close booking form"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Book Your Stay
              </h2>
              {/* Pass the property status to the BookingFormCard */}
              <BookingFormCard propertyId={String(property.property_id)} propertyStatus={property.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}