import { useState, useEffect, useRef } from "react";
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
  skipInitialFetch = false
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyWithImage[]>([]);
  const [total, setTotal] = useState(0);

  const lastFetchedParams = useRef<string | null>(null);

  console.log("usePropertyData: Hook initialized with:", { searchQuery, filters, offset, limit, skipInitialFetch });

  useEffect(() => {
    console.log("usePropertyData: useEffect triggered.");

    if (
      skipInitialFetch &&
      filters.category_id === undefined &&
      filters.sort_by === undefined
    ) {
      console.log(
        "usePropertyData: Skipping initial fetch due to `skipInitialFetch` being true and missing dynamic filters."
      );
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      const currentParamsKey = JSON.stringify({
        searchQuery,
        filters,
        offset,
        limit,
      });
      console.log("usePropertyData: Current params key for fetch:", currentParamsKey);

      if (lastFetchedParams.current === currentParamsKey) {
        console.log(
          "usePropertyData: Skipping fetch. Parameters are identical to last successful fetch."
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log("usePropertyData: Starting fetch operation...");

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

        const queryParams = Object.fromEntries(
          Object.entries(rawQueryParams).filter(
            ([_, v]) => v !== undefined && v !== null && v !== ""
          )
        );

        console.log(
          "usePropertyData: Prepared query parameters for API call:",
          queryParams
        );

        const data = await fetchProperties(queryParams);

        console.log("usePropertyData: API response data received (raw):", data);

        if (!Array.isArray(data.properties)) {
          console.error(
            "usePropertyData: Invalid API response: 'properties' is not an array.",
            data
          );
          throw new Error(
            "Invalid API response: 'properties' is not an array."
          );
        }

        const mappedProperties = data.properties
          .map((item) => {
            try {
              const mapped = mapApiPropertyToPropertyWithImage(item);
              console.log(`usePropertyData: Successfully mapped property ID ${item.property_id}. Image URL: ${mapped?.image}`);
              return mapped;
            } catch (err) {
              console.error(
                "usePropertyData: Mapping error for item (this item will be skipped):",
                err,
                item
              );
              return null;
            }
          })
          .filter((p): p is PropertyWithImage => p !== null);

        console.log("usePropertyData: Mapped properties (filtered, count:", mappedProperties.length, "first 5 images:", mappedProperties.slice(0,5).map(p => p.image));

        setProperties((prev) => {
          const newProperties = offset === 0 ? mappedProperties : [...prev, ...mappedProperties];
          console.log("usePropertyData: Setting properties state. Total properties after update:", newProperties.length);
          return newProperties;
        });
        setTotal(data.total || 0);
        console.log("usePropertyData: Total properties set to:", data.total || 0);

        lastFetchedParams.current = currentParamsKey;
        console.log("usePropertyData: lastFetchedParams updated to:", currentParamsKey);
      } catch (err) {
        console.error("usePropertyData: Error fetching properties:", err);
        setError(
          "Failed to fetch properties: " +
            (err instanceof Error ? err.message : String(err))
        );
        setProperties([]);
        setTotal(0);
        lastFetchedParams.current = null; // Clear ref on error to allow re-attempt
      } finally {
        setIsLoading(false);
        console.log("usePropertyData: Fetch operation finished. isLoading set to false.");
      }
    };

    const timer = setTimeout(fetchData, 0); // Still using setTimeout for debouncing

    return () => {
      console.log("usePropertyData: useEffect cleanup triggered. Clearing timer and setting isLoading to false.");
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [searchQuery, filters, offset, limit, skipInitialFetch]);

  console.log("usePropertyData: Hook returning current state:", {
    isLoading,
    error,
    propertiesLength: properties.length,
    total,
  });

  return { isLoading, error, properties, total };
}