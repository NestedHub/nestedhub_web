// lib/hooks/useRecommendedProperties.ts
import { useState, useEffect } from "react";
import {
  getRecommendedPropertyIds,
  getPropertiesByIds,
} from "@/lib/utils/recommendation-api";
import { ApiProperty } from "@/lib/types";
import { PropertyCardDisplayData } from "@/component/property/propertyCard";
import { mapApiPropertyToPropertyCardDisplay } from "@/lib/utils/property-mapper";

interface UseRecommendedPropertiesOptions {
  userId: number | null;
  limit?: number;
  skip?: boolean;
}

interface UseRecommendedPropertiesResult {
  recommendedProperties: PropertyCardDisplayData[];
  isLoading: boolean;
  error: string | null;
}

export function useRecommendedProperties({
  userId,
  limit = 6,
  skip = false,
}: UseRecommendedPropertiesOptions): UseRecommendedPropertiesResult {
  const [recommendedProperties, setRecommendedProperties] = useState<
    PropertyCardDisplayData[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Removed console.log("[REC_HOOK] --- Initializing useRecommendedProperties Hook ---");
  // Removed console.log(`[REC_HOOK] Initial userId: ${userId}`);
  // Removed console.log(`[REC_HOOK] Initial limit: ${limit}`);
  // Removed console.log(`[REC_HOOK] Initial skip: ${skip}`);

  useEffect(() => {
    // Removed console.log("[REC_HOOK] --- useEffect Triggered (fetchRecommendations) ---");
    // Removed console.log(`[REC_HOOK] Current userId: ${userId}`);
    // Removed console.log(`[REC_HOOK] Current limit: ${limit}`);
    // Removed console.log(`[REC_HOOK] Current skip: ${skip}`);

    const fetchRecommendations = async () => {
      if (skip || userId === null || userId === undefined) {
        // Removed console.log("[REC_HOOK] Skipping fetch: 'skip' is true OR 'userId' is null/undefined.");
        setIsLoading(false);
        setRecommendedProperties([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      // Removed console.log(`[REC_HOOK] Attempting to fetch recommendations for userId: ${userId}, limit: ${limit}`);

      try {
        // debugger; // Keep this debugger for the next test run if needed!

        // Step 1: Get recommended property IDs
        // Removed console.log(`[REC_HOOK] Calling getRecommendedPropertyIds for userId: ${userId}`);
        const ids = await getRecommendedPropertyIds(userId);
        // Removed console.log("[REC_HOOK] Received recommended property IDs:", ids);

        if (ids.length === 0) {
          // Removed console.log("[REC_HOOK] No recommended property IDs found from getRecommendedPropertyIds. Setting recommendedProperties to empty array.");
          setRecommendedProperties([]);
          setIsLoading(false);
          return;
        }

        // Step 2: Get full property data by IDs
        // Removed console.log(`[REC_HOOK] Calling getPropertiesByIds with IDs: ${ids.join(', ')} and limit: ${limit}`);
        const properties: any[] = await getPropertiesByIds(ids, limit);
        // Removed console.log("[REC_HOOK] Received raw properties from getPropertiesByIds:", properties);

        if (properties.length === 0) {
          // Removed console.log("[REC_HOOK] No properties found from getPropertiesByIds for the given IDs. Setting recommendedProperties to empty array.");
          setRecommendedProperties([]);
          setIsLoading(false);
          return;
        }

        // Step 3: Convert land_area and map to ApiProperty
        const apiProperties: ApiProperty[] = properties.map((prop) => ({
          ...prop,
          land_area:
            typeof prop.land_area === "string"
              ? Number(prop.land_area)
              : prop.land_area,
        }));
        // Removed console.log("[REC_HOOK] Converted to ApiProperty[] (land_area adjusted):", apiProperties);

        // Step 4: Map ApiProperty to PropertyCardDisplayData
        const displayProperties: PropertyCardDisplayData[] = apiProperties.map(
          mapApiPropertyToPropertyCardDisplay
        );
        // Removed console.log("[REC_HOOK] Mapped to PropertyCardDisplayData:", displayProperties);

        setRecommendedProperties(displayProperties);
        // Removed console.log("[REC_HOOK] Successfully set recommendedProperties. Count:", displayProperties.length);
      } catch (err: any) {
        console.error("Error fetching recommended properties:", err); // Keep essential error log
        setError(err.message || "Failed to load recommended properties.");
        setRecommendedProperties([]);
      } finally {
        setIsLoading(false);
        // Removed console.log("[REC_HOOK] --- useRecommendedProperties useEffect Finished ---");
      }
    };

    fetchRecommendations();
  }, [userId, limit, skip]);

  return { recommendedProperties, isLoading, error };
}
