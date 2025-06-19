// components/user/property-detail/RelatedPropertiesSection.tsx
import { Card, CardContent } from "@/component/ui/card";
import { ChevronRight, MapPin, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PropertyWithImage } from "@/lib/utils/properties"; // Import your PropertyWithImage interface
import PropertyCard from "@/component/property/propertyCard"; // Import the PropertyCard component

import { useState, useEffect } from "react";
import { getUserWishlist } from "@/lib/utils/wishlist-api";
import { WishListResponse } from "@/lib/types";

interface RelatedPropertiesSectionProps {
  properties: PropertyWithImage[];
  isLoading: boolean;
  error: string | null;
  isUserAuthenticated: boolean;
  isUserLoading: boolean;
}

export function RelatedPropertiesSection({
  properties,
  isLoading,
  error,
  isUserAuthenticated,
  isUserLoading,
}: RelatedPropertiesSectionProps) {

  const [userWishlist, setUserWishlist] = useState<WishListResponse[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Fetch user wishlist on component mount or when user authentication changes
  useEffect(() => {
    const fetchUserWishlist = async () => {
      setLoadingWishlist(true);
      try {
        if (isUserAuthenticated && !isUserLoading) {
          const wishlist = await getUserWishlist();
          if (wishlist) {
            setUserWishlist(wishlist);
          }
        } else if (!isUserAuthenticated && !isUserLoading) {
          setUserWishlist([]);
        }
      } catch (err) {
        console.error("Failed to fetch user wishlist for related properties:", err);
        setUserWishlist([]);
      } finally {
        setLoadingWishlist(false);
      }
    };

    if (!isUserLoading) {
      fetchUserWishlist();
    }
  }, [isUserAuthenticated, isUserLoading]);

  // Update wishlist state when a property's wishlist status changes
  const handleWishlistChange = (propertyId: string, isWishlisted: boolean) => {
    setUserWishlist((prevWishlist) => {
      const propertyIdNum = parseInt(propertyId);
      if (isWishlisted) {
        // Add if not already present
        if (!prevWishlist.some(item => item.property_id === propertyIdNum)) {
          return [
            ...prevWishlist,
            {
              id: Date.now(), // Temporary ID for client-side state
              property_id: propertyIdNum,
              user_id: 0, // Placeholder, ideally from useUser if passed down or not needed for this client-side state
              added_at: new Date().toISOString(),
            } as WishListResponse, // Type assertion for type safety
          ];
        }
      } else {
        // Remove
        return prevWishlist.filter((item) => item.property_id !== propertyIdNum);
      }
      return prevWishlist; // Return previous state if no change needed
    });
  };


  const overallLoading = isLoading || loadingWishlist || isUserLoading;

  if (overallLoading) {
    return (
      <div className="mt-12 text-center py-8">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading related properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 text-center py-8 text-red-500">
        <p>Error loading related properties: {error}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="mt-12 text-center py-8 text-gray-600">
        <p>No related properties found.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">More Properties Like This</h2>
        {/* The "View all" link should ideally go to a filtered search page */}
        <Link href="/user/rent" className="text-green-600 hover:text-green-800 text-lg font-semibold flex items-center transition-colors">
          View all <ChevronRight className="w-5 h-5 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            initialIsWishlisted={userWishlist.some(
              (item) => item.property_id === parseInt(property.id)
            )}
            onWishlistChange={handleWishlistChange}
            isUserAuthenticated={isUserAuthenticated}
            isUserLoading={isUserLoading}
          />
        ))}
      </div>
    </div>
  );
}