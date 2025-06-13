// lib/hooks/usePropertyData.ts
import { useState, useEffect, useRef } from "react"; // Add useRef
import { fetchProperties } from "@/lib/utils/api";
import {
  mapApiPropertyToPropertyWithImage,
  PropertyWithImage,
} from "@/lib/utils/properties";

interface Filters {
  city_id?: string;
  district_id?: string;
  commune_id?: string;
  category_id?: string;
  sort_by?: string;
  sort_order?: string;
}

export function usePropertyData(
  searchQuery: string,
  filters: Filters,
  offset = 0,
  limit = 50,
  // Add a new parameter `skipInitialFetch` for better control on home page
  // It allows `usePropertyData` to be defined but not fetch until `propertyCategories` are ready.
  skipInitialFetch = false // Default to false, allowing immediate fetch unless explicitly told to skip
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyWithImage[]>([]);
  const [total, setTotal] = useState(0);

  // Use a ref to keep track of the last fetched parameters to prevent infinite loops
  const lastFetchedParams = useRef<string | null>(null);

  useEffect(() => {
    // If skipInitialFetch is true and filters (specifically category_id for home page) are not yet defined,
    // prevent the initial fetch. This is useful for sections that depend on dynamically loaded filter values.
    if (
      skipInitialFetch &&
      filters.category_id === undefined &&
      filters.sort_by === undefined
    ) {
      console.log(
        "usePropertyData: Skipping initial fetch due to missing dynamic filters."
      );
      setIsLoading(false); // Ensure loading state is false if skipped
      return;
    }

    const fetchData = async () => {
      // Create a unique key for the current set of parameters
      const currentParamsKey = JSON.stringify({
        searchQuery,
        filters,
        offset,
        limit,
      });

      // If these parameters were the last ones successfully fetched, skip the fetch
      if (lastFetchedParams.current === currentParamsKey) {
        console.log(
          "usePropertyData: Skipping fetch, params are identical to last successful fetch."
        );
        setIsLoading(false); // Ensure loading is off if we're skipping
        return;
      }

      setIsLoading(true);
      setError(null); // Clear previous errors

      try {
        const rawQueryParams = {
          keyword: searchQuery,
          city_id: filters?.city_id,
          district_id: filters?.district_id,
          commune_id: filters?.commune_id,
          category_id: filters?.category_id,
          sort_by: filters?.sort_by,
          sort_order: filters?.sort_order,
          offset: offset.toString(),
          limit: limit.toString(),
        };

        // Filter out undefined, null, or empty string values from queryParams
        const queryParams = Object.fromEntries(
          Object.entries(rawQueryParams).filter(
            ([_, v]) => v !== undefined && v !== null && v !== ""
          )
        );

        console.log(
          "usePropertyData: Fetching properties with params:",
          queryParams,
          { searchQuery, filters, offset, limit }
        );

        const data = await fetchProperties(queryParams);

        console.log("usePropertyData: API response data:", {
          properties: data.properties,
          total: data.total,
        });

        if (!Array.isArray(data.properties)) {
          console.error(
            "usePropertyData: Invalid properties array received:",
            data
          );
          throw new Error(
            "Invalid API response: 'properties' is not an array."
          );
        }

        const mappedProperties = data.properties
          .map((item) => {
            try {
              return mapApiPropertyToPropertyWithImage(item);
            } catch (err) {
              console.error(
                "usePropertyData: Mapping error for item:",
                err,
                item
              );
              return null;
            }
          })
          .filter((p): p is PropertyWithImage => p !== null);

        console.log("usePropertyData: Mapped properties (count and data):", {
          count: mappedProperties.length,
          properties: mappedProperties,
        });

        // For offset 0, replace properties; otherwise, append
        setProperties((prev) =>
          offset === 0 ? mappedProperties : [...prev, ...mappedProperties]
        );
        setTotal(data.total || 0);

        // Update the ref only after a successful fetch
        lastFetchedParams.current = currentParamsKey;
      } catch (err) {
        console.error("usePropertyData: Error fetching properties:", err);
        setError(
          "Failed to fetch properties: " +
            (err instanceof Error ? err.message : String(err))
        );
        setProperties([]); // Clear properties on error
        setTotal(0); // Reset total on error
        lastFetchedParams.current = null; // Clear ref on error to allow re-attempt
      } finally {
        setIsLoading(false);
      }
    };

    // Use a short timeout to allow React's batched updates to complete
    // and prevent immediate re-runs if state updates trigger re-renders.
    // This is a common pattern for "debouncing" effect runs.
    const timer = setTimeout(fetchData, 0);

    return () => {
      clearTimeout(timer);
      // It's crucial to reset isLoading if component unmounts quickly or effect cleans up before fetch completes
      setIsLoading(false);
    };
  }, [searchQuery, filters, offset, limit, skipInitialFetch]); // Add skipInitialFetch to dependencies

  console.log("usePropertyData: Returning state for component:", {
    isLoading,
    error,
    propertiesLength: properties.length,
    total,
  });

  return { isLoading, error, properties, total };
}
