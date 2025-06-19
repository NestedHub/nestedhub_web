"use client";

import { useState, useEffect, useCallback } from "react";
import { useWishlist } from "@/lib/hooks/usewishlist"; // Ensure this path is correct
import PropertyCard from "@/component/property/propertyCard"; // Ensure this path is correct
import { Heart, XCircle, Search, ListChecks } from "lucide-react"; // Add Search and ListChecks icons
import { fetchPropertyById } from "@/lib/utils/api"; // Assuming you have this fetcher
import { WishListResponse } from "@/lib/types"; // Import WishListResponse
import { usePropertySelection } from "@/lib/hooks/usePropertySelection"; // Import the new selection hook
import { useRouter } from 'next/navigation'; // For navigation (Next.js App Router) or 'next/router' for Pages Router

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
  console.log("WishlistPage: Component rendering."); // Debug 1

  const router = useRouter(); // Initialize router
  const { wishlist, isLoading, error, removeProperty, refetchWishlist } = useWishlist();

  console.log("WishlistPage: useWishlist hook state - isLoading:", isLoading, "error:", error, "wishlist:", wishlist); // Debug 2

  // Use the new property selection hook
  const {
    selectedPropertyIds,
    toggleProperty,
    clearSelection,
    isPropertySelected,
  } = usePropertySelection();

  // State to control if the selection UI (checkboxes, special border) is active
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // State to hold the fully detailed property objects for display
  const [detailedWishlistProperties, setDetailedWishlistProperties] = useState<
    DisplayProperty[]
  >([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // You might need a way to determine if the user is authenticated and loading.
  // For demonstration, I'll use placeholders. In a real app, this would come from your useAuth hook.
  const isUserAuthenticated = true; // Placeholder: Replace with actual auth check
  const isUserLoading = false; // Placeholder: Replace with actual auth loading state


  // Fetch detailed property information for each item in the wishlist
  const fetchDetailedProperties = useCallback(
    async (currentWishlist: WishListResponse[]) => {
      console.log("fetchDetailedProperties: Starting to fetch details. Current wishlist:", currentWishlist); // Debug 3
      setIsLoadingDetails(true);
      setErrorDetails(null);
      try {
        const detailedPropsPromises = currentWishlist.map(async (item) => {
          console.log(`fetchDetailedProperties: Fetching detail for property_id: ${item.property_id}`); // Debug 4
          const propertyData = await fetchPropertyById(
            String(item.property_id)
          );
          console.log(`fetchDetailedProperties: Received data for property_id ${item.property_id}:`, propertyData); // Debug 5

          return {
            ...propertyData,
            is_wishlisted: true,
            property_id: item.property_id,
          } as DisplayProperty;
        });

        const resolvedProperties = await Promise.all(detailedPropsPromises);
        console.log("fetchDetailedProperties: All detailed properties resolved:", resolvedProperties); // Debug 6
        setDetailedWishlistProperties(resolvedProperties);
      } catch (err: any) {
        console.error(
          "fetchDetailedProperties: Failed to fetch detailed property data for wishlist:",
          err
        ); // Debug 7
        setErrorDetails(
          err.message || "Could not load details for all properties. Please try again."
        );
        setDetailedWishlistProperties([]); // Clear on error
      } finally {
        setIsLoadingDetails(false);
        console.log("fetchDetailedProperties: Finished fetching details."); // Debug 8
      }
    },
    []
  );

  // Trigger detailed property fetch whenever the core wishlist changes
  useEffect(() => {
    console.log("WishlistPage useEffect: Wishlist changed. Current wishlist:", wishlist); // Debug 9
    if (wishlist && wishlist.length > 0) {
      fetchDetailedProperties(wishlist);
    } else {
      console.log("WishlistPage useEffect: Wishlist is empty or null. Clearing details."); // Debug 10
      setDetailedWishlistProperties([]); // Clear details if wishlist is empty
      setIsLoadingDetails(false);
      setErrorDetails(null);
      clearSelection(); // Also clear selection if wishlist becomes empty
    }
  }, [wishlist, fetchDetailedProperties, clearSelection]); // Depend on wishlist, memoized fetcher, and clearSelection

  // Handle removing a property from wishlist (from PropertyCard or explicit button)
  const handleRemoveFromWishlist = async (propertyId: number) => {
    console.log(`handleRemoveFromWishlist: Attempting to remove property_id: ${propertyId}`); // Debug 11
    try {
      await removeProperty(propertyId);
      console.log(`handleRemoveFromWishlist: Property ${propertyId} removed from wishlist successfully.`); // Debug 12
      // The `useWishlist` hook handles optimistic updates or refetches,
      // which will then trigger the `useEffect` above to update `detailedWishlistProperties`.
      // Deselect the property if it was part of the comparison selection
      if (isPropertySelected(propertyId)) {
        toggleProperty(propertyId);
      }
    } catch (e: any) {
      console.error("handleRemoveFromWishlist: Failed to remove property:", e); // Debug 13
      alert(e.message || "Failed to remove property from wishlist.");
      refetchWishlist(); // If optimistic update failed, force a refetch
    }
  };

  // Handle the click on the "Compare" button
  const handleCompareClick = () => {
    console.log("handleCompareClick: Compare button clicked. Selected IDs:", selectedPropertyIds); // Debug 14
    if (selectedPropertyIds.length < 2) {
      alert("Please select at least two properties to compare.");
      return;
    }
    // Navigate to the comparison screen, passing selected IDs as query parameters
    const queryParams = new URLSearchParams();
    selectedPropertyIds.forEach(id => queryParams.append('propertyIds', id.toString()));
    router.push(`/user/compare?${queryParams.toString()}`);
  };

  console.log("WishlistPage: Render path - isLoading:", isLoading, "error:", error, "isLoadingDetails:", isLoadingDetails, "errorDetails:", errorDetails); // Debug 15

  // --- Loading States ---
  if (isLoading) {
    console.log("WishlistPage: Displaying initial loading state from useWishlist."); // Debug 16
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p className="text-lg font-semibold">Loading your wishlist...</p>
      </div>
    );
  }

  // --- Error States ---
  if (error) {
    console.error("WishlistPage: Displaying error state from useWishlist. Error object:", error); // Debug 17
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          My Wishlist
        </h1>
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4">
          {/* Toggle Selection Mode Button */}
          {detailedWishlistProperties.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(prev => !prev);
                if (isSelectionMode) { // If turning selection mode OFF, clear selection
                  clearSelection();
                }
                console.log("WishlistPage: Toggle selection mode button clicked. New mode:", !isSelectionMode); // Debug 18
              }}
              className={`flex items-center px-4 py-2 rounded-md shadow-sm transition-colors text-sm
                ${isSelectionMode
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <ListChecks className="h-5 w-5 mr-2" />
              {isSelectionMode ? 'Exit Selection Mode' : 'Select for Comparison'}
            </button>
          )}

          {/* Clear Selection Button (only visible in selection mode and if items are selected) */}
          {isSelectionMode && selectedPropertyIds.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Clear Selection ({selectedPropertyIds.length})
            </button>
          )}

          {/* Compare Button (only visible in selection mode and if 2+ items selected) */}
          {isSelectionMode && (
            <button
              onClick={handleCompareClick}
              disabled={selectedPropertyIds.length < 2} // Disable if less than 2 selected
              className={`flex items-center px-6 py-3 rounded-md shadow-sm transition-colors text-base
                ${selectedPropertyIds.length >= 2
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <Search className="h-5 w-5 mr-2" />
              Compare ({selectedPropertyIds.length})
            </button>
          )}
        </div>
      </div>

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
                rating: property.rating,
              }}
              initialIsWishlisted={true}
              canOnlyRemove={true}
              onWishlistChange={(_, isWishlisted) => {
                if (!isWishlisted) handleRemoveFromWishlist(property.property_id);
              }}
              // Pass user authentication status to PropertyCard
              isUserAuthenticated={isUserAuthenticated}
              isUserLoading={isUserLoading}
              // Pass selection props to PropertyCard
              onSelect={toggleProperty} // Use toggleProperty from the hook
              isSelected={isPropertySelected(property.property_id)} // Check if selected
              isSelectionMode={isSelectionMode} // Pass the selection mode status
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