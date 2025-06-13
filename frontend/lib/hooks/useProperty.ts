// lib/hooks/useProperty.ts
import { useState, useEffect } from 'react';
import { fetchPropertyById } from '@/lib/utils/api';
// Import both API response type and your internal application type
import { ApiProperty, Property, PropertyMedia } from '@/lib/types';

interface UsePropertyResult {
  property: Property | null;
  isLoading: boolean;
  error: string | null;
}

export function useProperty(propertyId: string): UsePropertyResult {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setError("Property ID is missing.");
      setIsLoading(false);
      return;
    }

    const getProperty = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch raw data conforming to ApiResponseProperty
        const rawData: ApiProperty = await fetchPropertyById(propertyId);

        // --- Data Transformation to match your application's 'Property' type ---
        const transformedProperty: Property = {
          property_id: rawData.property_id,
          title: rawData.title,
          description: rawData.description,
          bedrooms: rawData.bedrooms,
          bathrooms: rawData.bathrooms,
          land_area: rawData.land_area,
          floor_area: rawData.floor_area,
          status: rawData.status,
          updated_at: rawData.updated_at,
          listed_at: rawData.listed_at,
          user_id: rawData.user_id,
          category_name: rawData.category_name,
          // If 'rating' is derived or from another API, add it here.
          // Otherwise, remove it from your 'Property' interface as well.
          // rating: someCalculatedRating, // Example if you derive it

          pricing: {
            rent_price: rawData.pricing.rent_price,
            deposit: rawData.pricing.deposit, // This will be undefined if not present in API
            electricity_price: rawData.pricing.electricity_price,
            water_price: rawData.pricing.water_price,
            // 'other_price' is not in API, remove it if not needed or add default
            available_from: rawData.pricing.available_from,
          },
          location: rawData.location, // Matches directly

          // Transform API's media format to your component's expected format
          media: rawData.media.map((apiMediaItem, idx) => ({
            id: idx, // Assign an ID, as API didn't provide one directly for media items
            url: apiMediaItem.media_url || null, // Use media_url, ensure null if empty for Image component
            is_main: apiMediaItem.media_type === 'image' && idx === 0, // Heuristic: first image is main
          })).filter(item => item.url !== null) as PropertyMedia[], // Filter out null URLs

          // Transform API's features format to an array of strings (feature names)
          features: rawData.features.map(feature => feature.feature_name),
        };
        // --- End of Data Transformation ---

        setProperty(transformedProperty);
      } catch (err: any) {
        console.error("Failed to fetch property:", err);
        setError(err.message || 'An unknown error occurred while fetching property details.');
      } finally {
        setIsLoading(false);
      }
    };

    getProperty();
  }, [propertyId]);

  return { property, isLoading, error };
}