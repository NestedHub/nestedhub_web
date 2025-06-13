// component/property/propertyCard.tsx
"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Bed, Bath } from "lucide-react";
import { useState, useEffect } from "react";
// Assuming these are correctly implemented and handle API calls
import { addPropertyToWishlist, removePropertyFromWishlist } from "@/lib/utils/wishlist-api";
// No need to import useUser here anymore if the parent handles it for the button state

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    category: string;
    price: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    image: string;
    rating?: number; // Added optional rating property
  };
  initialIsWishlisted?: boolean;
  onWishlistChange?: (propertyId: string, isWishlisted: boolean) => void;
  canOnlyRemove?: boolean;
  // <--- NEW PROPS: Pass authentication status from parent
  isUserAuthenticated: boolean;
  isUserLoading: boolean;
}

export default function PropertyCard({
  property,
  initialIsWishlisted = false,
  onWishlistChange,
  canOnlyRemove = false,
  isUserAuthenticated, // <--- Destructure new prop
  isUserLoading,       // <--- Destructure new prop
}: PropertyCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  // Effect to keep internal state in sync with the initialIsWishlisted prop.
  useEffect(() => {
    setIsWishlisted(initialIsWishlisted);
  }, [initialIsWishlisted]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event from bubbling up to the Link component

    // Check if user is logged in before allowing wishlist toggle
    if (!isUserAuthenticated) { // <--- Use the new prop
      alert("Please log in to add items to your wishlist."); // Or redirect to login
      return; // Stop the function execution if not logged in
    }

    const newState = canOnlyRemove ? false : !isWishlisted;

    // Optimistic UI update: Assume success and update state immediately
    setIsWishlisted(newState);

    try {
      if (newState) {
        await addPropertyToWishlist(parseInt(property.id));
        console.log(`Added property ${property.id} to wishlist.`);
      } else {
        await removePropertyFromWishlist(parseInt(property.id));
        console.log(`Removed property ${property.id} from wishlist.`);
      }
      // If API call is successful, notify the parent component (if a callback is provided)
      onWishlistChange?.(property.id, newState);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      // Revert UI if API call fails
      setIsWishlisted(!newState); // Revert to the previous state
      alert("Failed to update wishlist. Please try again.");
    }
  };

  // Determine if the wishlist button should be disabled
  // It should be disabled if user data is still loading OR if the user is not authenticated.
  const isWishlistButtonDisabled = isUserLoading || !isUserAuthenticated; // <--- Use new props

  return (
    <Link href={`/user/rent/${property.id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg flex flex-col h-full">
        <div className="relative w-full h-48 sm:h-56 lg:h-64 flex-shrink-0">
          <Image
            src={property.image || "/property.png"}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 hover:scale-105"
            priority={false}
          />
          <button
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 p-2 bg-white rounded-full shadow-md z-10 transition-colors ${
              isWishlistButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            disabled={isWishlistButtonDisabled} // <--- Disable the button based on auth status
            aria-label={
              canOnlyRemove
                ? "Remove from wishlist"
                : isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            title={isWishlistButtonDisabled ? "Login to add to wishlist" : (isWishlisted ? "Remove from wishlist" : "Add to wishlist")}
          >
            <Heart
              className={`h-5 w-5 ${
                isWishlisted && !isWishlistButtonDisabled ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>
          {property.rating !== undefined && (
            <div className="absolute bottom-3 left-3 flex items-center bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-sm font-medium text-gray-800">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1.5" />
              <span>{property.rating?.toFixed(1) || 'N/A'}</span>
            </div>
          )}
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide z-10">
            {property.category}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 leading-tight line-clamp-2 min-h-[2.5em]">
            {property.title}
          </h3>
          <p className="text-gray-500 text-sm mb-3 truncate">
            {property.location}
          </p>

          <div className="flex justify-between items-center mb-3">
            <span className="text-green-600 text-xl font-bold">
              ${property.price}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-600 text-sm border-t border-gray-100 pt-3 mt-auto">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1.5 text-gray-400" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1.5 text-gray-400" />
              <span>{property.bathrooms} Baths</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}