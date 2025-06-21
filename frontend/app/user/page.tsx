// component/user/page.tsx
"use client";
import { Home, Building, DoorOpen } from "lucide-react";
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";
import FilterSection from "@/component/user/FilterSection";
import HeroSection from "@/component/user/HeroSection";
import PropertySection from "@/component/property/propertySection";
import { usePropertyFilters } from "@/lib/hooks/usePropertyFilters";
import { usePropertyData } from "@/lib/hooks/usePropertyData";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react"; // Import useState, useEffect
import { getUserWishlist } from "@/lib/utils/wishlist-api"; // Import wishlist API
import { WishListResponse } from "@/lib/types"; // Assuming you have this type


export default function UserHomePage() {
  const router = useRouter();
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
    propertyCategories,
  } = usePropertyFilters();

  // State for user's wishlist
  const [userWishlist, setUserWishlist] = useState<WishListResponse[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Fetch user wishlist on component mount
  useEffect(() => {
    const fetchUserWishlist = async () => {
      setLoadingWishlist(true);
      try {
        const wishlist = await getUserWishlist();
        if (wishlist) {
          setUserWishlist(wishlist);
        }
      } catch (error) {
        console.error("Failed to fetch user wishlist:", error);
      } finally {
        setLoadingWishlist(false);
      }
    };
    fetchUserWishlist();
  }, []);

  // Update wishlist state when a property's wishlist status changes
  const handleWishlistChange = (propertyId: string, isWishlisted: boolean) => {
    setUserWishlist((prevWishlist) => {
      const propertyIdNum = parseInt(propertyId);
      if (isWishlisted) {
        // Add to wishlist if not already there
        if (!prevWishlist.some(item => item.property_id === propertyIdNum)) {
          // You may need to adjust user_id and added_at as appropriate for your app
          return [
            ...prevWishlist,
            {
              id: Date.now(), // Temporary ID, replace with real one if needed
              property_id: propertyIdNum,
              user_id: 0, // Replace with actual user_id if available
              added_at: new Date().toISOString(),
            } as WishListResponse,
          ];
        }
      } else {
        // Remove from wishlist
        return prevWishlist.filter((item) => item.property_id !== propertyIdNum);
      }
      return prevWishlist; // No change needed
    });
  };

  // Helper to get category ID from its name
  const getCategoryIdByName = (name: string) => {
    const category = propertyCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
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

  // --- Fetching data for each section separately using usePropertyData ---

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


  const overallIsLoading = isLoadingNewListings || isLoadingHouses || isLoadingApartments || isLoadingRooms || loadingWishlist; // Include loadingWishlist
  const overallError = errorNewListings || errorHouses || errorApartments || errorRooms;

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
            <PropertySection
              title="New Listings"
              properties={newListings}
              viewAllLink="/user/properties?sort_by=listed_at&sort_order=desc"
              maxItems={3}
              icon={<span className="text-2xl">🆕</span>}
              userWishlist={userWishlist} // Pass userWishlist to PropertySection
              onWishlistChange={handleWishlistChange} // Pass callback
            />
            {houseId && (
              <PropertySection
                title="Houses"
                properties={houses}
                viewAllLink={`/user/properties?category_id=${houseId}`}
                maxItems={3}
                icon={<Home className="h-6 w-6" />}
                userWishlist={userWishlist} // Pass userWishlist
                onWishlistChange={handleWishlistChange} // Pass callback
              />
            )}
            {apartmentId && (
              <PropertySection
                title="Apartments"
                properties={apartments}
                viewAllLink={`/user/properties?category_id=${apartmentId}`}
                maxItems={3}
                icon={<Building className="h-6 w-6" />}
                userWishlist={userWishlist} // Pass userWishlist
                onWishlistChange={handleWishlistChange} // Pass callback
              />
            )}
            {roomId && (
              <PropertySection
                title="Rooms"
                properties={rooms}
                viewAllLink={`/user/properties?category_id=${roomId}`}
                maxItems={3}
                icon={<DoorOpen className="h-6 w-6" />}
                userWishlist={userWishlist} // Pass userWishlist
                onWishlistChange={handleWishlistChange} // Pass callback
              />
            )}
          </div>
        </div>
      )}
      <Footer userType="user" />
    </div>
  );
}