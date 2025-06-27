// lib/utils/recommendation-api.ts

// (Keep all your type definitions as they are)
export type Media = {
    media_url: string;
    media_type: string;
};

export type Pricing = {
    rent_price: string;
    electricity_price: string;
    water_price: string;
    other_price: string;
    available_from: string;
};

export type Location = {
    location_id: number;
    property_id: number;
    city_id: number;
    district_id: number;
    commune_id: number;
    street_number: string;
    latitude: string;
    longitude: string;
    city_name: string;
    district_name: string;
    commune_name: string;
};

export type Property = {
    property_id: number;
    title: string;
    description: string;
    bedrooms: number;
    bathrooms: number;
    land_area: string;
    floor_area: string;
    status: 'available' | 'rented'; // Or whatever statuses you have
    updated_at: string;
    listed_at: string;
    user_id: number;
    category_name: string;
    rating: string | null;
    pricing: Pricing;
    location: Location;
    media: Media[];
    features: string[]; // Or a more specific Feature type if available
};

export type RecommendedPropertyIdsResponse = {
    property_ids: number[];
};

const BACKEND_1_BASE_URL = process.env.NEXT_PUBLIC_API_RECOMMENDATION_BASE_URL || "http://localhost:8001"; // Your first backend
const BACKEND_2_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000" ; // Your second backend

/**
 * Fetches a list of recommended property IDs for a given user.
 * @param userId The ID of the user for whom to get recommendations.
 * @returns A promise that resolves to an array of property IDs.
 */
export async function getRecommendedPropertyIds(userId: number): Promise<number[]> {
  console.log(`[REC_API_CALL] Attempting to fetch recommended IDs for userId: ${userId}`);
  if (typeof userId !== 'number' || isNaN(userId)) {
    console.error("[REC_API_CALL] Invalid userId provided to getRecommendedPropertyIds, returning empty array:", userId);
    return [];
  }

  const url = `${BACKEND_1_BASE_URL}/recommend/hybrid/${userId}`;
  console.log(`[REC_API_CALL] Fetching from URL (getRecommendedPropertyIds): ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        // Add Authorization header if your recommendation backend requires it
        // 'Authorization': `Bearer ${YOUR_ACCESS_TOKEN_FUNCTION()}`,
      },
    });

    console.log(`[REC_API_CALL] Response status for getRecommendedPropertyIds: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[REC_API_CALL] Error response body for getRecommendedPropertyIds:`, errorData);
      throw new Error(`Error fetching recommended property IDs: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data: RecommendedPropertyIdsResponse = await response.json();
    console.log("[REC_API_CALL] Raw data received for recommended IDs:", data);

    if (data && Array.isArray(data.property_ids)) {
      console.log(`[REC_API_CALL] Successfully extracted ${data.property_ids.length} property IDs.`);
      return data.property_ids;
    } else {
      console.warn("[REC_API_CALL] Unexpected data structure for recommended IDs. Expected 'property_ids' array. Received:", data);
      return [];
    }
  } catch (error) {
    console.error("[REC_API_CALL] Failed to fetch recommended property IDs:", error);
    return [];
  }
}

/**
 * Fetches full property details for a given list of property IDs.
 * @param propertyIds An array of property IDs.
 * @param limit The maximum number of properties to return (default: 6).
 * @returns A promise that resolves to an array of Property objects.
 */
export async function getPropertiesByIds(propertyIds: number[], limit: number = 6): Promise<Property[]> {
  console.log(`[REC_API_CALL] Attempting to fetch properties by IDs: ${propertyIds.join(', ')} with limit: ${limit}`);
  if (!propertyIds || propertyIds.length === 0) {
    console.log("[REC_API_CALL] No property IDs provided to getPropertiesByIds, returning empty array.");
    return [];
  }

  const uniquePropertyIds = Array.from(new Set(propertyIds));
  const idsString = uniquePropertyIds.join(',');

  try {
    const url = new URL(`${BACKEND_2_BASE_URL}/api/properties/recommended`);
    url.searchParams.append('property_ids', idsString);
    url.searchParams.append('limit', String(limit));

    console.log(`[REC_API_CALL] Fetching from URL (getPropertiesByIds): ${url.toString()}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        // Add Authorization header if your main backend requires it
        // 'Authorization': `Bearer ${YOUR_ACCESS_TOKEN_FUNCTION()}`,
      },
    });

    console.log(`[REC_API_CALL] Response status for getPropertiesByIds: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[REC_API_CALL] Error response body for getPropertiesByIds:`, errorData);
      throw new Error(`Error fetching properties by IDs: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data: Property[] = await response.json();
    console.log("[REC_API_CALL] Raw data received for getPropertiesByIds:", data);

    if (Array.isArray(data)) {
        console.log(`[REC_API_CALL] Successfully received ${data.length} properties.`);
        return data;
    } else {
        console.warn("[REC_API_CALL] Unexpected data structure for properties by IDs. Expected an array. Received:", data);
        return [];
    }

  } catch (error) {
    console.error("[REC_API_CALL] Failed to fetch properties by IDs:", error);
    return [];
  }
}