// component/user/page.tsx
"use client";
import { Home, Building, DoorOpen, Sparkles } from "lucide-react";
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";
import FilterSection from "@/component/user/FilterSection";
import HeroSection from "@/component/user/HeroSection";
import PropertySection from "@/component/property/propertySection";
import { PropertyCardDisplayData } from "@/component/property/propertyCard";
import { usePropertyFilters } from "@/lib/hooks/usePropertyFilters";
import { usePropertyData } from "@/lib/hooks/usePropertyData";
import { useRecommendedProperties } from "@/lib/hooks/useRecommendedProperties";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { getUserWishlist } from "@/lib/utils/wishlist-api";
import { WishListResponse } from "@/lib/types";
import { useAuthContext } from '@/lib/context/AuthContext'; // Import your AuthContext

export default function UserHomePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated: isUserAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  // Directly use authUser.user_id as the current user identifier
  // It's a number as per UserResponse, so no parsing needed.
  // It will be `null` if authUser is null.
  const currentUserId = authUser?.user_id || null;

  const [userWishlist, setUserWishlist] = useState<WishListResponse[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    // Only fetch wishlist if user is authenticated and we have a valid user_id
    if (isUserAuthenticated && currentUserId !== null) {
      const fetchUserWishlist = async () => {
        setLoadingWishlist(true);
        try {
          // Assuming getUserWishlist already knows the current user from auth token.
          // If it needs the user_id explicitly, pass it here:
          // const wishlist = await getUserWishlist(currentUserId);
          const wishlist = await getUserWishlist();
          if (wishlist) {
            // Ensure wishlist property_ids are numbers for consistency
            setUserWishlist(wishlist.map(item => ({...item, property_id: Number(item.property_id)})));
          }
        } catch (error) {
          console.error("Failed to fetch user wishlist:", error);
        } finally {
          setLoadingWishlist(false);
        }
      };
      fetchUserWishlist();
    } else if (!isUserAuthenticated && !isAuthLoading) {
        // If user is not authenticated or auth is done loading and no user, clear wishlist
        setUserWishlist([]);
        setLoadingWishlist(false);
    }
  }, [isUserAuthenticated, currentUserId, isAuthLoading]);

  const handleWishlistChange = (propertyId: string, isWishlisted: boolean) => {
    setUserWishlist((prevWishlist) => {
      const propertyIdNum = parseInt(propertyId);
      if (isWishlisted) {
        if (currentUserId === null) {
            console.warn("Attempted to add to wishlist without a valid user ID.");
            return prevWishlist; // Don't add if no user ID
        }
        if (!prevWishlist.some(item => item.property_id === propertyIdNum)) {
          return [
            ...prevWishlist,
            {
              id: Date.now(), // Client-side temp ID for the wishlist entry itself
              property_id: propertyIdNum,
              user_id: currentUserId, // Use the actual user_id from auth
              added_at: new Date().toISOString(),
            } as WishListResponse,
          ];
        }
      } else {
        return prevWishlist.filter((item) => item.property_id !== propertyIdNum);
      }
      return prevWishlist;
    });
  };

  // Define propertyCategories and its type
  type PropertyCategory = { id: number | string; name: string };
  const [propertyCategories, setPropertyCategories] = useState<PropertyCategory[]>([]);

  useEffect(() => {
    // Replace this with your actual API call
    setPropertyCategories([
      { id: 1, name: "House" },
      { id: 2, name: "Apartment" },
      { id: 3, name: "Room" },
    ]);
  }, []);

  const getCategoryIdByName = (name: string) => {
    const category = propertyCategories.find((cat: PropertyCategory) => cat.name.toLowerCase() === name.toLowerCase());
    if (!propertyCategories || propertyCategories.length === 0) {
      return undefined;
    }
    return category?.id ? String(category.id) : undefined;
  };

  const memoizedCategoryIds = useMemo(() => {
    return {
      houseId: getCategoryIdByName("house"),
      apartmentId: getCategoryIdByName("apartment"),
      roomId: getCategoryIdByName("room"),
    };
  }, [propertyCategories]);

  const { houseId, apartmentId, roomId } = memoizedCategoryIds;

  // Use the property filters hook to get filters, searchQuery, and related handlers
  const {
    filters,
    searchQuery,
    setSearchQuery,
    dropdownStates,
    toggleDropdown,
    handleFilterChange,
    handleSortChange,
    clearFilters,
    getSelectedLocationText,
    getSelectedPropertyCategoryText,
    getSelectedSortText,
    cities,
    districts,
    communes,
  } = usePropertyFilters();

  // --- Fetching data for each section separately ---
  const {
    properties: newListings,
    isLoading: isLoadingNewListings,
    error: errorNewListings,
  } = usePropertyData("", { sort_by: "listed_at", sort_order: "desc" }, 0, 6, false);

  const {
    properties: houses,
    isLoading: isLoadingHouses,
    error: errorHouses,
  } = usePropertyData(
    "",
    { category_id: houseId },
    0,
    3,
    !houseId
  );

  const {
    properties: apartments,
    isLoading: isLoadingApartments,
    error: errorApartments,
  } = usePropertyData(
    "",
    { category_id: apartmentId },
    0,
    3,
    !apartmentId
  );

  const {
    properties: rooms,
    isLoading: isLoadingRooms,
    error: errorRooms,
  } = usePropertyData(
    "",
    { category_id: roomId },
    0,
    3,
    !roomId
  );

  // Fetching data for recommended properties using the new hook
  const {
    recommendedProperties,
    isLoading: isLoadingRecommendedProperties,
    error: errorRecommendedProperties,
  } = useRecommendedProperties({
    userId: currentUserId, // This will be null if user is not logged in or auth is loading
    limit: 3,
    skip: currentUserId === null || !isUserAuthenticated, // Skip if no user ID OR not authenticated
  });

  const overallIsLoading =
    isLoadingNewListings ||
    isLoadingHouses ||
    isLoadingApartments ||
    isLoadingRooms ||
    isLoadingRecommendedProperties ||
    loadingWishlist ||
    isAuthLoading; // Include authentication loading state

  const overallError =
    errorNewListings ||
    errorHouses ||
    errorApartments ||
    errorRooms ||
    errorRecommendedProperties;

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      keyword: searchQuery || "",
      ...(filters.city_id && { city_id: filters.city_id }),
      ...(filters.district_id && { district_id: filters.district_id }),
      ...(filters.commune_id && { commune_id: filters.commune_id }),
      ...(filters.category_id && { category_id: filters.category_id }),
      ...(filters.sort_by && { sort_by: filters.sort_by }),
      ...(filters.sort_order && { sort_order: filters.sort_order }),
    }).toString();
    router.push(`/user/rent?${queryParams}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header userType="user" />
      <div className="container mx-auto px-4 py-12">
        <FilterSection
          filters={filters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dropdownStates={dropdownStates}
          toggleDropdown={toggleDropdown}
          handleFilterChange={handleFilterChange}
          handleSortChange={handleSortChange}
          clearFilters={clearFilters}
          getSelectedLocationText={() => getSelectedLocationText() ?? ""}
          getSelectedPropertyCategoryText={() =>
            getSelectedPropertyCategoryText() ?? ""
          }
          getSelectedSortText={getSelectedSortText}
          cities={cities}
          districts={districts}
          communes={communes}
          propertyCategories={propertyCategories}
          onSearch={handleSearch}
        />
        <HeroSection />
      </div>

      {overallIsLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4" />
          <p className="text-gray-600 text-lg">Loading amazing properties...</p>
        </div>
      ) : overallError ? (
        <div className="flex flex-col justify-center items-center py-20">
          <p className="text-red-600 text-lg">
            Error loading properties: {overallError}. Please try again.
          </p>
        </div>
      ) : (
        <div className="bg-white">
          <div className="container mx-auto px-4 py-16">
            {/* Display Recommended Properties Section ONLY if user is authenticated AND we have a valid user_id AND there are recommendations */}
            {isUserAuthenticated && currentUserId !== null && recommendedProperties.length > 0 && (
              <PropertySection
                title="Recommended for You"
                properties={recommendedProperties}
                viewAllLink={`/user/properties?user_id=${currentUserId}&recommendations=true`}
                maxItems={3}
                icon={<Sparkles className="h-6 w-6" />}
                userWishlist={userWishlist}
                onWishlistChange={handleWishlistChange}
              />
            )}
            <PropertySection
              title="New Listings"
              properties={newListings}
              viewAllLink="/user/properties?sort_by=listed_at&sort_order=desc"
              maxItems={3}
              icon={<span className="text-2xl">🆕</span>}
              userWishlist={userWishlist}
              onWishlistChange={handleWishlistChange}
            />
            {houseId && (
              <PropertySection
                title="Houses"
                properties={houses}
                viewAllLink={`/user/properties?category_id=${houseId}`}
                maxItems={3}
                icon={<Home className="h-6 w-6" />}
                userWishlist={userWishlist}
                onWishlistChange={handleWishlistChange}
              />
            )}
            {apartmentId && (
              <PropertySection
                title="Apartments"
                properties={apartments}
                viewAllLink={`/user/properties?category_id=${apartmentId}`}
                maxItems={3}
                icon={<Building className="h-6 w-6" />}
                userWishlist={userWishlist}
                onWishlistChange={handleWishlistChange}
              />
            )}
            {roomId && (
              <PropertySection
                title="Rooms"
                properties={rooms}
                viewAllLink={`/user/properties?category_id=${roomId}`}
                maxItems={3}
                icon={<DoorOpen className="h-6 w-6" />}
                userWishlist={userWishlist}
                onWishlistChange={handleWishlistChange}
              />
            )}
          </div>
        </div>
      )}
      <Footer userType="user" />
    </div>
  );
}