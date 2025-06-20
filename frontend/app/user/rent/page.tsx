"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";
import PropertyCard from "@/component/property/propertyCard";
import FilterSection from "@/component/user/FilterSection";
import { usePropertyFilters } from "@/lib/hooks/usePropertyFilters";
import { usePropertyData } from "@/lib/hooks/usePropertyData";
import { getUserWishlist } from "@/lib/utils/wishlist-api";
import { WishListResponse } from "@/lib/types";
import { useUser } from "@/lib/hooks/useUser";

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  console.log("PropertiesPage: Component rendering. Current time:", new Date().toISOString());

  const { user, isAuthenticated, isLoading: isUserLoading } = useUser();
  console.log("PropertiesPage: useUser hook status: User:", user, "Authenticated:", isAuthenticated, "User Loading:", isUserLoading);

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

  console.log("PropertiesPage: Current filters from usePropertyFilters:", filters);
  console.log("PropertiesPage: Current searchQuery from usePropertyFilters:", searchQuery);

  const [userWishlist, setUserWishlist] = useState<WishListResponse[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    console.log("PropertiesPage: Wishlist useEffect triggered. Dependencies: isAuthenticated=", isAuthenticated, "isUserLoading=", isUserLoading);
    const fetchUserWishlist = async () => {
      setLoadingWishlist(true);
      console.log("PropertiesPage: Starting fetchUserWishlist function.");
      try {
        if (isAuthenticated && !isUserLoading) {
          console.log("PropertiesPage: User is authenticated and user data is loaded. Attempting to fetch wishlist.");
          const wishlist = await getUserWishlist();
          if (wishlist) {
            console.log("PropertiesPage: Wishlist fetched successfully. Count:", wishlist.length, "Data:", wishlist);
            setUserWishlist(wishlist);
          } else {
            console.log("PropertiesPage: Wishlist API returned null or undefined. Setting empty wishlist.");
            setUserWishlist([]);
          }
        } else if (!isAuthenticated && !isUserLoading) {
          console.log("PropertiesPage: User is NOT authenticated and user data is loaded. Clearing wishlist.");
          setUserWishlist([]);
        } else {
          console.log("PropertiesPage: User authentication state not settled yet (isUserLoading is true). Deferring wishlist fetch.");
        }
      } catch (error) {
        console.error("PropertiesPage: Failed to fetch user wishlist:", error);
        setUserWishlist([]);
      } finally {
        setLoadingWishlist(false);
        console.log("PropertiesPage: fetchUserWishlist function finished. loadingWishlist set to false.");
      }
    };

    if (!isUserLoading) {
      fetchUserWishlist();
    } else {
      console.log("PropertiesPage: isUserLoading is true. Skipping fetchUserWishlist for now.");
    }
  }, [isAuthenticated, isUserLoading]);

  const handleWishlistChange = (propertyId: string, isWishlisted: boolean) => {
    console.log(`PropertiesPage: handleWishlistChange called for propertyId: ${propertyId}, isWishlisted: ${isWishlisted}`);
    setUserWishlist((prevWishlist) => {
      const propertyIdNum = parseInt(propertyId);
      if (isWishlisted) {
        if (!prevWishlist.some(item => item.property_id === propertyIdNum)) {
          console.log(`PropertiesPage: Adding property ${propertyIdNum} to wishlist state (optimistic update).`);
          return [
            ...prevWishlist,
            {
              id: Date.now(), // Temporary ID for client-side state, ideally from API
              property_id: propertyIdNum,
              user_id: user?.user_id || 0, // Use actual user ID if available
              added_at: new Date().toISOString(),
            } as WishListResponse,
          ];
        } else {
          console.log(`PropertiesPage: Property ${propertyIdNum} already in wishlist state. No change.`);
        }
      } else {
        console.log(`PropertiesPage: Removing property ${propertyIdNum} from wishlist state.`);
        return prevWishlist.filter((item) => item.property_id !== propertyIdNum);
      }
      return prevWishlist;
    });
  };

  useEffect(() => {
    console.log("PropertiesPage: URL searchParams Effect triggered. Parsing URL:", searchParams.toString());

    const initialFilters: { [key: string]: string | undefined } = {};
    let initialSearchQuery = "";
    let initialSortBy = "";
    let initialSortOrder = "";

    searchParams.forEach((value, key) => {
      console.log(`PropertiesPage: Processing searchParam - Key: ${key}, Value: ${value}`);
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
    console.log("PropertiesPage: Setting initialSearchQuery to:", initialSearchQuery);

    for (const key in initialFilters) {
      if (initialFilters[key]) {
        console.log(`PropertiesPage: Applying initial filter from URL: ${key} = ${initialFilters[key]}`);
        handleFilterChange(
          key as keyof typeof filters,
          initialFilters[key] as string
        );
      }
    }
    if (initialSortBy && initialSortOrder) {
      console.log(`PropertiesPage: Applying initial sort from URL: sortBy=${initialSortBy}, sortOrder=${initialSortOrder}`);
      handleSortChange(initialSortBy, initialSortOrder);
    }

    console.log("PropertiesPage: Finished initializing filters from URL.");
  }, [searchParams, handleFilterChange, handleSortChange, setSearchQuery, filters]);

  const [offset, setOffset] = useState(0);
  console.log("PropertiesPage: Current offset state:", offset);

  const { isLoading, error, properties, total } = usePropertyData(
    searchQuery,
    filters,
    offset,
    50,
    false
  );

  console.log("PropertiesPage: Data from usePropertyData hook received:", {
    isLoading,
    error,
    propertiesCount: properties.length,
    total,
  });

  const handleSearch = () => {
    console.log("PropertiesPage: handleSearch function called.");
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
      "PropertiesPage: Constructing new URL for search. Params:",
      queryParams
    );
    setOffset(0);
    console.log("PropertiesPage: Resetting offset to 0 for new search.");
    router.push(`/user/rent?${queryParams}`);
    console.log(`PropertiesPage: Navigating to /user/rent?${queryParams}`);
  };

  const getPageTitle = () => {
    let title = "Search Results";
    if (filters.category_id) {
      const category = propertyCategories.find(
        (c) => c.id.toString() === filters.category_id
      );
      title = category ? `${category.name}s` : "Search Results";
    }
    console.log("PropertiesPage: Generated page title:", title);
    return title;
  };

  console.log("PropertiesPage: Rendering JSX content based on data status.");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header userType="user" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600">
            {isLoading || loadingWishlist || isUserLoading
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
            console.log("PropertiesPage: Clear Filters button clicked. Clearing all filters and navigating.");
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
                onClick={() => { console.log("PropertiesPage: Sort by Price ↑ clicked."); handleSortChange("rent_price", "asc"); }}
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
                onClick={() => { console.log("PropertiesPage: Sort by Price ↓ clicked."); handleSortChange("rent_price", "desc"); }}
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
                onClick={() => { console.log("PropertiesPage: Sort by Newest clicked."); handleSortChange("listed_at", "desc"); }}
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

          {isLoading || loadingWishlist || isUserLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4" />
              <p className="text-gray-600 text-lg">Loading properties...</p>
              {/* Removed direct console.log from here as it's within JSX where a ReactNode is expected */}
              {/* console.log("PropertiesPage: Displaying loading spinner.") */}
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
                  console.log("PropertiesPage: Clear All Filters on error button clicked.");
                  setSearchQuery("");
                  clearFilters();
                  setOffset(0);
                  router.push("/user/rent");
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
              {/* Removed direct console.log from here */}
              {/* console.log("PropertiesPage: Displaying error message and clear filters button.") */}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => {
                  const isPropertyWishlisted = userWishlist.some(
                    (item) => item.property_id === parseInt(property.id)
                  );
                  // IMPORTANT LOGS FOR IMAGE DEBUGGING (these are okay as they are inside .map callback)
                  console.log(`PropertiesPage: Rendering PropertyCard for ID: ${property.id}`);
                  console.log(`PropertiesPage:   Property ID ${property.id} image_url: ${property.image}`);
                  console.log(`PropertiesPage:   Property ID ${property.id} initialIsWishlisted: ${isPropertyWishlisted}`);
                  // console.log("PropertiesPage: Full property object for ID:", property.id, property);
                  return (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      initialIsWishlisted={isPropertyWishlisted}
                      onWishlistChange={handleWishlistChange}
                      isUserAuthenticated={isAuthenticated}
                      isUserLoading={isUserLoading}
                    />
                  );
                })}
              </div>
              {properties.length < total && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => {
                      console.log(
                        "PropertiesPage: Load More Properties button clicked. Incrementing offset from", offset, "to", offset + 50
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
                  {/* Removed direct console.log from here */}
                  {/* console.log("PropertiesPage: Displaying Load More Properties button.") */}
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
                    console.log("PropertiesPage: Clear All Filters on no properties button clicked.");
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
                    console.log("PropertiesPage: Back to Home button clicked (from no properties).");
                    router.push("/user");
                  }}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Home
                </button>
              </div>
              {/* Removed direct console.log from here */}
              {/* console.log("PropertiesPage: Displaying 'No properties found' message.") */}
            </div>
          )}
        </div>
      </div>
      <Footer userType="user" />
    </div>
  );
}