// hooks/useUserProperties.ts
import { useState, useEffect, useCallback } from 'react';
import { getUserProperties, PropertyRead } from '@/lib/utils/user-properties'; // Adjust the import path as needed

export type UseUserPropertiesResult = {
  properties: PropertyRead[] | null;
  isLoading: boolean;
  error: Error | null;
  fetchProperties: (userId: number) => Promise<void>;
};

/**
 * @function useUserProperties
 * @description A custom hook for fetching a list of properties owned by a specific user.
 * @returns {UseUserPropertiesResult} An object containing the properties, loading status, error state, and a function to trigger the fetch.
 */
export const useUserProperties = (): UseUserPropertiesResult => {
  const [properties, setProperties] = useState<PropertyRead[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperties = useCallback(async (userId: number) => {
    setIsLoading(true);
    setProperties(null);
    setError(null);
    try {
      const data = await getUserProperties(userId);
      setProperties(data);
    } catch (err: any) {
      console.error(`Error fetching properties for user ${userId}:`, err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optional: You could add an effect here to automatically fetch on mount if a userId is provided to the hook.
  // For now, I've made it explicit via `fetchProperties` call, similar to your delete example.

  return { properties, isLoading, error, fetchProperties };
};