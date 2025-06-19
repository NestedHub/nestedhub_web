// app/compare/page.tsx
"use client"; // This component needs to be a Client Component to use hooks like useSearchParams

import { useSearchParams } from "next/navigation"; // For App Router's useSearchParams
import { useEffect, useState, Suspense } from "react"; // Import Suspense
import { usePropertyComparison } from "@/lib/hooks/usePropertyComparison"; // Your plain React hook for comparison
import { XCircle } from "lucide-react";
import Link from "next/link"; // For linking back to the wishlist
import Image from "next/image"; // Import Next.js Image component

// Define a type for the property data you actually want to display in the comparison table.
// This should match PropertyComparisonItem from your usePropertyComparison hook's definition.
interface PropertyComparisonDisplayItem {
  property_id: number;
  title: string;
  rent_price: number;
  city_name: string;
  district_name: string;
  bedrooms: number;
  bathrooms: number;
  floor_area: number; // Assuming this maps to what you need for comparison
  features: string[]; // Array of feature strings
  media_url?: string | string[]; // IMPORTANT: Handles single string OR array of strings
  status: string;
  // Add any other specific fields you want to compare from your API response
  // Example:
  // description: string;
  // land_area: number;
  // category_name: string;
}

// Create a separate component that uses useSearchParams
function ComparePageContent() {
  const searchParams = useSearchParams();
  const [idsToCompare, setIdsToCompare] = useState<number[]>([]);

  // Parse propertyIds from URL query parameters when the component mounts or searchParams change
  useEffect(() => {
    const propertyIdsParam = searchParams.getAll("propertyIds"); // Gets all values for 'propertyIds' key
    const parsedIds = propertyIdsParam
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));
    setIdsToCompare(parsedIds);

    console.log("ComparePage - Parsed IDs from URL:", parsedIds);
  }, [searchParams]);

  // Use your plain React property comparison hook to fetch data
  const { data, isLoading, error, refetch } =
    usePropertyComparison(idsToCompare);

  useEffect(() => {
    console.log("ComparePage - isLoading:", isLoading);
    console.log("ComparePage - error:", error);
    console.log("ComparePage - data:", data);
  }, [isLoading, error, data]);

  // --- Initial Checks / Loading / Error States ---

  // Case 1: No properties selected (e.g., direct navigation to /compare)
  if (idsToCompare.length === 0) {
    console.log(
      "ComparePage - No properties selected for comparison (idsToCompare is empty)."
    );
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-xl font-semibold">
          No properties selected for comparison.
        </p>
        <p className="text-sm mt-2">
          Please go back to your wishlist and select properties to compare.
        </p>
        <Link
          href="/user/wishlist"
          className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Wishlist
        </Link>
      </div>
    );
  }

  // Case 2: Data is loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p className="text-lg font-semibold">
          Loading properties for comparison...
        </p>
      </div>
    );
  }

  // Case 3: Error fetching data
  if (error) {
    console.log("ComparePage - Displaying error UI.");
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold">Error loading comparison data:</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={refetch}
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Case 4: No properties returned by the API for the given IDs
  const propertiesToDisplay: PropertyComparisonDisplayItem[] =
    data?.properties || [];
  if (propertiesToDisplay.length === 0) {
    console.log(
      "ComparePage - No properties returned from API, or data.properties is empty."
    );
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p className="text-lg font-semibold">
          No comparison data available for the selected properties.
        </p>
        <p className="text-sm mt-2">
          Some properties might not exist or data could not be fetched.
        </p>
        <Link
          href="/user/wishlist"
          className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go back to Wishlist
        </Link>
      </div>
    );
  }

  // Helper to extract a value safely for display
  const getValue = (
    prop: PropertyComparisonDisplayItem,
    key: keyof PropertyComparisonDisplayItem
  ) => {
    const value = prop[key];
    return value !== undefined && value !== null ? value.toString() : "N/A";
  };

  // Define the features/properties you want to compare in the table.
  // You can customize this array based on what's most relevant for comparison.
  const comparisonFields = [
    {
      label: "Property Title",
      key: "title" as keyof PropertyComparisonDisplayItem,
    },
    {
      label: "Main Image",
      key: "media_url" as keyof PropertyComparisonDisplayItem,
      isImage: true,
    }, // 'isImage' flag for special rendering
    {
      label: "Rent Price",
      key: "rent_price" as keyof PropertyComparisonDisplayItem,
      prefix: "$",
    },
    { label: "City", key: "city_name" as keyof PropertyComparisonDisplayItem },
    {
      label: "District",
      key: "district_name" as keyof PropertyComparisonDisplayItem,
    },
    {
      label: "Bedrooms",
      key: "bedrooms" as keyof PropertyComparisonDisplayItem,
    },
    {
      label: "Bathrooms",
      key: "bathrooms" as keyof PropertyComparisonDisplayItem,
    },
    {
      label: "Floor Area (sqm)",
      key: "floor_area" as keyof PropertyComparisonDisplayItem,
    },
    {
      label: "Features",
      key: "features" as keyof PropertyComparisonDisplayItem,
      transform: (value: string[]) =>
        value && value.length > 0 ? value.join(", ") : "N/A",
    },
    { label: "Status", key: "status" as keyof PropertyComparisonDisplayItem },
    // Add more fields as needed, e.g., 'description', 'land_area', 'category_name'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        Property Comparison
      </h1>

      {/* Comparison Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              {/* Empty corner for feature column */}
              <th className="py-3 px-4 bg-gray-100 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider sticky left-0 z-10 border-r border-gray-200">
                Feature
              </th>
              {/* Property Columns (Headers) */}
              {propertiesToDisplay.map((prop) => (
                <th
                  key={prop.property_id}
                  className="py-3 px-4 bg-gray-100 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200"
                >
                  <div className="flex flex-col items-center">
                    <h3 className="font-bold text-base line-clamp-2">
                      {prop.title}
                    </h3>
                    {/* Optionally link to property detail page */}
                    <Link
                      href={`/user/rent/${prop.property_id}`}
                      className="text-blue-600 hover:underline text-xs mt-1"
                    >
                      View Details
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field, index) => (
              <tr
                key={field.label}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                {/* Feature Label Column */}
                <td className="py-3 px-4 border-b border-r border-gray-200 text-left font-medium text-gray-700 sticky left-0 z-0 bg-inherit">
                  {field.label}
                </td>
                {/* Property Feature Values */}
                {propertiesToDisplay.map((prop) => {
                  let displayContent: React.ReactNode;
                  const rawValue =
                    prop[field.key as keyof PropertyComparisonDisplayItem];

                  if (field.isImage) {
                    let imageUrl: string | undefined;

                    // Handle if media_url is an array (taking the first element) or a single string
                    if (Array.isArray(rawValue) && rawValue.length > 0) {
                      imageUrl = rawValue[0]; // Use the first image if it's an array
                    } else if (typeof rawValue === "string") {
                      imageUrl = rawValue; // Use directly if it's a string
                    }

                    displayContent = imageUrl ? (
                      <Image
                        src={imageUrl} // Use the derived imageUrl
                        alt={prop.title}
                        width={100} // Adjust size as needed
                        height={60} // Adjust size as needed
                        style={{ objectFit: "cover" }}
                        className="mx-auto rounded-md"
                      />
                    ) : (
                      "N/A" // Display N/A if no image URL is found
                    );
                  } else if (field.transform) {
                    // Apply transform function if provided (e.g., for features array)
                    displayContent = field.transform(rawValue as any);
                  } else {
                    // Default display for other fields
                    displayContent = field.prefix
                      ? `${field.prefix}${getValue(prop, field.key)}`
                      : getValue(prop, field.key);
                  }

                  return (
                    <td
                      key={`${prop.property_id}-${field.key}`}
                      className="py-3 px-4 border-b border-gray-200 text-center text-gray-800 align-top"
                    >
                      {displayContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/user/wishlist"
          className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Go back to Wishlist
        </Link>
      </div>
    </div>
  );
}

// Export the main page component wrapped with Suspense
export default function ComparePage() {
  return (
    <Suspense fallback={<div>Loading comparison page...</div>}>
      <ComparePageContent />
    </Suspense>
  );
}