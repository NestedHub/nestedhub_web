"use client";

import { useState, useEffect, useCallback } from "react";
import { useWishlist } from "@/lib/hooks/useWishlist"; // Ensure this path is correct
import PropertyCard from "@/component/property/propertyCard"; // Ensure this path is correct
import { Heart, XCircle } from "lucide-react"; // Only keeping Heart and XCircle
import { fetchPropertyById } from "@/lib/utils/api"; // Assuming you have this fetcher
import { WishListResponse } from "@/lib/types"; // Import WishListResponse

// Define a type for the property data you actually want to display in PropertyCard
// This should match what your PropertyCard expects.
interface DisplayProperty {
  property_id: number; // Coming from WishListResponse
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  land_area: number;
  floor_area: number;
  status: string;
  updated_at: string;
  listed_at: string;
  user_id: number;
  category_name: string;
  rating: number; // Assuming rating is available after fetching details
  pricing: {
    rent_price: number;
    electricity_price: number;
    water_price: number;
    available_from: string;
    // Add deposit or other pricing details if your API provides them
  };
  location: {
    location_id: number;
    property_id: number;
    city_id: number;
    district_id: number;
    commune_id: number;
    street_number: string;
    latitude: number;
    longitude: number;
    city_name: string;
    district_name: string;
    commune_name: string;
  };
  media: {
    media_url: string;
    media_type: string;
  }[];
  features: {
    feature_id: number;
    feature_name: string;
  }[];
  is_wishlisted: boolean; // Add this prop for your PropertyCard to show heart icon
}

export default function WishlistPage() {
  const { wishlist, isLoading, error, removeProperty, refetchWishlist } =
    useWishlist();

  // State to hold the fully detailed property objects for display
  const [detailedWishlistProperties, setDetailedWishlistProperties] = useState<
    DisplayProperty[]
  >([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Fetch detailed property information for each item in the wishlist
  const fetchDetailedProperties = useCallback(
    async (currentWishlist: WishListResponse[]) => {
      setIsLoadingDetails(true);
      setErrorDetails(null);
      try {
        const detailedPropsPromises = currentWishlist.map(async (item) => {
          // Use your existing fetchPropertyById, ensure it's imported
          const propertyData = await fetchPropertyById(
            String(item.property_id)
          );

          // Map propertyData to DisplayProperty interface, ensuring property_id is correct
          return {
            ...propertyData,
            is_wishlisted: true, // Mark as wishlisted since it's from the wishlist
            property_id: item.property_id, // Ensure property_id from wishlist item is used
          } as DisplayProperty;
        });

        const resolvedProperties = await Promise.all(detailedPropsPromises);
        setDetailedWishlistProperties(resolvedProperties);
      } catch (err: any) {
        console.error(
          "Failed to fetch detailed property data for wishlist:",
          err
        );
        setErrorDetails(
          "Could not load details for all properties. Please try again."
        );
        setDetailedWishlistProperties([]); // Clear on error
      } finally {
        setIsLoadingDetails(false);
      }
    },
    []
  );

  // Trigger detailed property fetch whenever the core wishlist changes
  useEffect(() => {
    if (wishlist && wishlist.length > 0) {
      fetchDetailedProperties(wishlist);
    } else {
      setDetailedWishlistProperties([]); // Clear details if wishlist is empty
      setIsLoadingDetails(false);
      setErrorDetails(null);
    }
  }, [wishlist, fetchDetailedProperties]); // Depend on wishlist and memoized fetcher

  // Handle removing a property from wishlist (from PropertyCard or explicit button)
  const handleRemoveFromWishlist = async (propertyId: number) => {
    try {
      await removeProperty(propertyId);
      // The `useWishlist` hook handles optimistic updates or refetches,
      // which will then trigger the `useEffect` above to update `detailedWishlistProperties`.
      console.log(`Property ${propertyId} removed from wishlist.`);
    } catch (e: any) {
      console.error("Failed to remove property:", e);
      alert(e.message || "Failed to remove property from wishlist.");
      refetchWishlist(); // If optimistic update failed, force a refetch
    }
  };

  // --- Loading States ---
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p className="text-lg font-semibold">Loading your wishlist...</p>
      </div>
    );
  }

  // --- Error States ---
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold">Error loading your wishlist:</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={refetchWishlist}
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        My Wishlist
      </h1>

      {isLoadingDetails ? (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg font-semibold">Loading property details...</p>
        </div>
      ) : errorDetails ? (
        <div className="text-center py-12 text-red-600">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-xl font-semibold">
            Error fetching property details:
          </p>
          <p className="text-sm">{errorDetails}</p>
        </div>
      ) : detailedWishlistProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {detailedWishlistProperties.map((property) => (
          <PropertyCard
            key={property.property_id}
            property={{
              id: property.property_id.toString(),
              title: property.title,
              category: property.category_name,
              price: property.pricing?.rent_price
                ? property.pricing.rent_price.toLocaleString()
                : "N/A",
              location: property.location?.city_name || "Unknown",
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              image:
                property.media && property.media.length > 0
                  ? property.media[0].media_url
                  : "/placeholder.jpg",
              rating: property.rating, // Pass rating if available
            }}
            initialIsWishlisted={true} // Hydrate internal state as wishlisted
            canOnlyRemove={true} // Only allow removal from wishlist here
            onWishlistChange={(_, isWishlisted) => {
              // If removed, trigger parent handler
              if (!isWishlisted) handleRemoveFromWishlist(property.property_id);
            }}
            isUserAuthenticated={true} // or use actual authentication state if available
            isUserLoading={false} // or use actual loading state if available
          />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
            <Heart className="w-full h-full" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">
            Your wishlist is empty!
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            It looks like you haven't saved any properties yet. Start exploring
            our listings and click the heart icon to add properties you love to your
            wishlist.
          </p>
          {/* Optionally, add a button to navigate to property listings */}
          <a
            href="/user/rent" // Adjust this path to your property listing page
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Browse Properties
          </a>
        </div>
      )}
    </div>
  );
}