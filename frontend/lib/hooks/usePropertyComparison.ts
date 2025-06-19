// hooks/usePropertyComparison.ts
"use client"; // If this hook is used in a client component in Next.js App Router

import { useState, useEffect, useCallback } from 'react';
// Adjust this import path to where your compareProperties function is located.
// It should be the file that uses your getAuthHeaders function.
import { compareProperties } from '@/lib/api/compare'; 

// Define the shape of a single property comparison item
interface PropertyComparisonItem {
    property_id: number;
    title: string;
    rent_price: number; // Assuming Decimal becomes number in TS
    city_name: string;
    district_name: string;
    bedrooms: number;
    bathrooms: number;
    floor_area: number; // Assuming Decimal becomes number in TS
    features: string[];
    media_url?: string; // Optional field
    status: string; // Assuming PropertyStatusEnum becomes string
}

// Define the shape of the response from your API
interface PropertyComparisonResponse {
    properties: PropertyComparisonItem[];
}

// Define the return type of the hook
interface UsePropertyComparisonState {
    data: PropertyComparisonResponse | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Custom hook to fetch property comparison data using native React hooks.
 *
 * @param {number[]} propertyIds - An array of property IDs to compare.
 * @returns {UsePropertyComparisonState} An object containing the data, loading state, error, and a refetch function.
 */
export const usePropertyComparison = (propertyIds: number[]): UsePropertyComparisonState => {
    const [data, setData] = useState<PropertyComparisonResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState<number>(0); // To manually trigger refetch

    const fetchData = useCallback(async () => {
        // Only run the fetch if propertyIds are provided and not empty
        if (!propertyIds || propertyIds.length === 0) {
            setData(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null); // Clear previous errors

        try {
            const result = await compareProperties(propertyIds);
            setData(result);
        } catch (err: any) {
            console.error("Failed to fetch property comparison data:", err);
            setError(err.message || "An unknown error occurred while comparing properties.");
            setData(null); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, [propertyIds, refetchTrigger]); // Depend on propertyIds and refetchTrigger

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Re-run when fetchData callback changes

    const refetch = useCallback(() => {
        setRefetchTrigger(prev => prev + 1); // Increment trigger to force fetchData to run
    }, []);

    return {
        data,
        isLoading,
        error,
        refetch,
    };
};