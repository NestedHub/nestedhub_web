// lib/hooks/useProperty.ts
import { useState, useEffect } from 'react';
import { fetchPropertyById } from '@/lib/utils/api';
import { Property } from '@/lib/properties-type'; // Import the unified 'Property' interface

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
      setError(null); // Clear any previous errors
      try {
        // Assume fetchPropertyById returns a Promise<Property> that matches your API schema
        const data: Property = await fetchPropertyById(propertyId);
        setProperty(data);
      } catch (err: any) {
        console.error("Failed to fetch property:", err);
        setError(err.message || 'An unknown error occurred while fetching property details.');
      } finally {
        setIsLoading(false);
      }
    };

    getProperty();
  }, [propertyId]); // Re-run effect if propertyId changes

  return { property, isLoading, error };
}