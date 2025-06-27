// component/property/propertyCard.tsx
"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Bed, Bath } from "lucide-react";
import { useState, useEffect } from "react";
import {
  addPropertyToWishlist,
  removePropertyFromWishlist,
} from "@/lib/utils/wishlist-api";

// NEW: Define the explicit type for the 'property' prop that PropertyCard expects
export type PropertyCardDisplayData = {
  id: string;
  title: string;
  category: string;
  price: string; // Formatted string, e.g., "$1,200.00"
  location: string; // Combined string, e.g., "Sangkat Boeung Kak Pir, Khan Tuol Kouk"
  bedrooms: number;
  bathrooms: number;
  image: string; // URL for the main image
  rating?: number; // Optional rating, if available (your API example shows null, so make it optional here)
};

interface PropertyCardProps {
  property: PropertyCardDisplayData; // Use the new type here
  initialIsWishlisted?: boolean;
  onWishlistChange?: (propertyId: string, isWishlisted: boolean) => void;
  canOnlyRemove?: boolean;
  isUserAuthenticated: boolean;
  isUserLoading: boolean;
  onSelect?: (propertyId: number) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

export default function PropertyCard({
  property,
  initialIsWishlisted = false,
  onWishlistChange,
  canOnlyRemove = false, // And destructured here
  isUserAuthenticated,
  isUserLoading,
  onSelect,
  isSelected,
  isSelectionMode = false,
}: PropertyCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  useEffect(() => {
    setIsWishlisted(initialIsWishlisted);
  }, [initialIsWishlisted]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isUserAuthenticated) {
      alert("Please log in to add items to your wishlist.");
      return;
    }

    const newState = canOnlyRemove ? false : !isWishlisted; // `canOnlyRemove` used here

    setIsWishlisted(newState); // Optimistic UI update

    try {
      if (newState) {
        await addPropertyToWishlist(parseInt(property.id));
        console.log(`Added property ${property.id} to wishlist.`);
      } else {
        await removePropertyFromWishlist(parseInt(property.id));
        console.log(`Removed property ${property.id} from wishlist.`);
      }
      onWishlistChange?.(property.id, newState);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      setIsWishlisted(!newState);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const isWishlistButtonDisabled = isUserLoading || !isUserAuthenticated;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(parseInt(property.id));
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg flex flex-col h-full
        ${isSelectionMode ? "cursor-pointer" : ""}
        ${
          isSelected && isSelectionMode
            ? "ring-2 ring-blue-500 border-blue-500"
            : "border border-transparent"
        }`}
    >
      {!isSelectionMode ? (
        <Link href={`/user/rent/${property.id}`} className="block h-full">
          <CardContent
            property={property}
            isWishlisted={isWishlisted}
            isWishlistButtonDisabled={isWishlistButtonDisabled}
            toggleWishlist={toggleWishlist}
            isSelectionMode={isSelectionMode}
            canOnlyRemove={canOnlyRemove} // <--- Pass it here
          />
        </Link>
      ) : (
        <CardContent
          property={property}
          isWishlisted={isWishlisted}
          isWishlistButtonDisabled={isWishlistButtonDisabled}
          toggleWishlist={toggleWishlist}
          isSelectionMode={isSelectionMode}
          isSelected={isSelected}
          canOnlyRemove={canOnlyRemove} // <--- Pass it here
        />
      )}
    </div>
  );
}

// Helper component to avoid repeating card content inside Link/div
interface CardContentProps {
  property: PropertyCardProps["property"];
  isWishlisted: boolean;
  isWishlistButtonDisabled: boolean;
  toggleWishlist: (e: React.MouseEvent) => Promise<void>;
  isSelectionMode: boolean;
  isSelected?: boolean;
  canOnlyRemove: boolean; // <--- ADDED HERE
}

const CardContent = (
  {
    property,
    isWishlisted,
    isWishlistButtonDisabled,
    toggleWishlist,
    isSelectionMode,
    isSelected,
    canOnlyRemove,
  }: CardContentProps // <--- DESTRUCTURED HERE
) => (
  <>
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

      {isSelectionMode && (
        <div className="absolute top-3 left-3 z-10 p-1 bg-white rounded-full shadow-md">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
        </div>
      )}

      <button
        onClick={toggleWishlist}
        className={`absolute top-3 right-3 p-2 bg-white rounded-full shadow-md z-10 transition-colors ${
          isWishlistButtonDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-50"
        }`}
        disabled={isWishlistButtonDisabled}
        aria-label={
          canOnlyRemove // <--- Used here
            ? "Remove from wishlist"
            : isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        title={
          isWishlistButtonDisabled
            ? "Login to add to wishlist"
            : isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
      >
        <Heart
          className={`h-5 w-5 ${
            isWishlisted && !isWishlistButtonDisabled
              ? "fill-red-500 text-red-500"
              : "text-gray-400"
          }`}
        />
      </button>
      {property.rating !== undefined && (
        <div className="absolute bottom-3 left-3 flex items-center bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-sm font-medium text-gray-800">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1.5" />
          <span>
            {typeof property.rating === "number" && !isNaN(property.rating)
              ? property.rating.toFixed(1)
              : "N/A"}
          </span>
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
      <p className="text-gray-500 text-sm mb-3 truncate">{property.location}</p>

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
  </>
);
