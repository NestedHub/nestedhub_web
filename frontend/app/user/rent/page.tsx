// pages/user/rent/index.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";
import PropertyCard from "@/component/property/propertyCard";
import FilterSection from "@/component/user/FilterSection";
import { usePropertyFilters } from "@/lib/hooks/usePropertyFilters";
import { usePropertyData } from "@/lib/hooks/usePropertyData";
import { getUserWishlist } from "@/lib/utils/wishlist-api"; // Import wishlist API
import { WishListResponse } from "@/lib/types"; // Assuming you have this type for wishlist items
import { useUser } from "@/lib/hooks/useUser"; // <--- IMPORT useUser HOOK

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // <--- USE useUser HOOK HERE
  const { user, isAuthenticated, isLoading: isUserLoading } = useUser();

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

  // Fetch user wishlist on component mount or when user authentication changes
  // <--- UPDATED useEffect for wishlist fetching
  useEffect(() => {
    const fetchUserWishlist = async () => {
      setLoadingWishlist(true);
      try {
        // Only fetch wishlist if user is authenticated and not loading
        if (isAuthenticated && !isUserLoading) {
          const wishlist = await getUserWishlist();
          if (wishlist) {
            setUserWishlist(wishlist);
          }
        } else if (!isAuthenticated && !isUserLoading) {
          // If not authenticated, clear the wishlist to reflect no user
          setUserWishlist([]);
        }
      } catch (error) {
        console.error("Failed to fetch user wishlist:", error);
        // Optionally clear wishlist on error
        setUserWishlist([]);
      } finally {
        setLoadingWishlist(false);
      }
    };

    // Only run this effect if user loading state has settled
    if (!isUserLoading) {
      fetchUserWishlist();
    }
  }, [isAuthenticated, isUserLoading]); // Depend on isAuthenticated and isUserLoading

  // Update wishlist state when a property's wishlist status changes
  const handleWishlistChange = (propertyId: string, isWishlisted: boolean) => {
    setUserWishlist((prevWishlist) => {
      const propertyIdNum = parseInt(propertyId);
      if (isWishlisted) {
        // Add to wishlist if not already there
        if (!prevWishlist.some(item => item.property_id === propertyIdNum)) {
          // IMPORTANT: If your API returns the *actual* created wishlist item,
          // it's better to refetch or use that data to ensure consistency.
          // For optimistic UI, this is a decent temporary solution.
          return [
            ...prevWishlist,
            {
              id: Date.now(), // Temporary ID for client-side state, ideally from API
              property_id: propertyIdNum,
              user_id: user?.user_id || 0, // <--- Use actual user ID if available
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

  useEffect(() => {
    console.log(
      "PropertiesPage: Initializing filters from URL searchParams:",
      searchParams.toString()
    );

    const initialFilters: { [key: string]: string | undefined } = {};
    let initialSearchQuery = "";
    let initialSortBy = "";
    let initialSortOrder = "";

    searchParams.forEach((value, key) => {
      if (key === "keyword") {
        initialSearchQuery = value;
      } else if (key === "sort_by") {
        initialSortBy = value;
      } else if (key === "sort_order") {
        initialSortOrder = value;
      } else {
        initialFilters[key] = value;
      }
    });

    setSearchQuery(initialSearchQuery);
    for (const key in initialFilters) {
      if (initialFilters[key]) {
        handleFilterChange(
          key as keyof typeof filters,
          initialFilters[key] as string
        );
      }
    }
    if (initialSortBy && initialSortOrder) {
      handleSortChange(initialSortBy, initialSortOrder);
    }

    console.log("PropertiesPage: Filters initialized to:", {
      initialSearchQuery,
      initialFilters,
      initialSortBy,
      initialSortOrder,
    });
  }, [searchParams]);

  const [offset, setOffset] = useState(0);

  const { isLoading, error, properties, total } = usePropertyData(
    searchQuery,
    filters,
    offset,
    50,
    false
  );

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

    console.log(
      "PropertiesPage: Search submitted, navigating with params:",
      queryParams
    );
    setOffset(0);
    router.push(`/user/rent?${queryParams}`);
  };

  const getPageTitle = () => {
    if (filters.category_id) {
      const category = propertyCategories.find(
        (c) => c.id.toString() === filters.category_id
      );
      return category ? `${category.name}s` : "Search Results";
    }
    return "Search Results";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header userType="user" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600">
            {isLoading || loadingWishlist || isUserLoading // <--- Added isUserLoading to overall loading check
              ? "Loading properties..."
              : error
              ? `Error loading properties: ${error}`
              : `${properties.length} of ${total} properties found`}{" "}
          </p>
        </div>

        <FilterSection
          filters={filters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dropdownStates={dropdownStates}
          toggleDropdown={toggleDropdown}
          handleFilterChange={handleFilterChange}
          handleSortChange={handleSortChange}
          clearFilters={() => {
            console.log("PropertiesPage: Clearing filters");
            clearFilters();
            setSearchQuery("");
            setOffset(0);
            router.push("/user/rent");
          }}
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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results
              </h2>
              {!isLoading && !error && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {properties.length} found{" "}
                </span>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>Sort by:</span>
              <button
                onClick={() => handleSortChange("rent_price", "asc")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filters.sort_by === "rent_price" &&
                  filters.sort_order === "asc"
                    ? "bg-green-100 text-green-700"
                    : "hover:bg-gray-100"
                }`}
              >
                Price ↑
              </button>
              <button
                onClick={() => handleSortChange("rent_price", "desc")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filters.sort_by === "rent_price" &&
                  filters.sort_order === "desc"
                    ? "bg-green-100 text-green-700"
                    : "hover:bg-gray-100"
                }`}
              >
                Price ↓
              </button>
              <button
                onClick={() => handleSortChange("listed_at", "desc")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filters.sort_by === "listed_at" &&
                  filters.sort_order === "desc"
                    ? "bg-green-100 text-green-700"
                    : "hover:bg-gray-100"
                }`}
              >
                Newest
              </button>
            </div>
          </div>

          {isLoading || loadingWishlist || isUserLoading ? ( // Show loading for all relevant data
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4" />
              <p className="text-gray-600 text-lg">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Error Loading Properties
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {error}. Please try again later or adjust your search terms.
              </p>
              <button
                onClick={() => {
                  console.log("PropertiesPage: Clearing filters on error");
                  setSearchQuery("");
                  clearFilters();
                  setOffset(0);
                  router.push("/user/rent");
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    // Determine if the property is in the user's wishlist
                    initialIsWishlisted={userWishlist.some(
                      (item) => item.property_id === parseInt(property.id)
                    )}
                    onWishlistChange={handleWishlistChange} // Pass the callback
                    // <--- Pass authentication status to PropertyCard
                    isUserAuthenticated={isAuthenticated}
                    isUserLoading={isUserLoading}
                  />
                ))}
              </div>
              {properties.length < total && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => {
                      console.log(
                        "PropertiesPage: Loading more properties, new offset:",
                        offset + 50
                      );
                      setOffset((prev) => prev + 50);
                    }}
                    disabled={isLoading}
                    className={`bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl transition-colors font-medium ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Loading..." : "Load More Properties"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any properties matching your criteria. Try
                adjusting your search terms or filters.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    console.log(
                      "PropertiesPage: Clearing filters on no properties"
                    );
                    setSearchQuery("");
                    clearFilters();
                    setOffset(0);
                    router.push("/user/rent");
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => {
                    console.log("PropertiesPage: Navigating back to home");
                    router.push("/user");
                  }}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer userType="user" />
    </div>
  );
}