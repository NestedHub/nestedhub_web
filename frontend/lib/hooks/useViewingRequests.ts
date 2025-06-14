// useViewingRequests.ts
import { useState, useEffect, useCallback } from 'react';
import {
  ViewingRequestResponse,
  ViewingRequestCreate,
  ViewingRequestUpdate,
  SuccessMessageResponse,
  createViewingRequest,
  getUserViewingRequests,
  getUserUpcomingViewingRequests,
  updateViewingRequest,
  deleteViewingRequest,
  acceptViewingRequest,
  denyViewingRequest,
  getPropertyViewingRequests,
  getOwnerViewingRequests,
  getOwnerUpcomingViewingRequests,
  getViewingRequestById,
} from '@/lib/api/viewingrequest'; // Adjust the path if your viewingRequestsApi.ts file is elsewhere

/**
 * Generic hook for fetching data.
 * Manages loading, error, and data states for read operations.
 * @param fetcher A function that returns a Promise for the data.
 * @param initialData The initial data state.
 * @param dependencies Dependencies array for useEffect. If the dependencies change, data will be refetched.
 */
function useFetch<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      console.error("Error during fetch:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}


/**
 * Generic hook for performing mutations (POST, PATCH, DELETE).
 * Manages loading, error, and data states for write operations.
 * @param mutationFn The function that performs the API mutation.
 */
function useMutation<TResult, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TResult>
) {
  const [data, setData] = useState<TResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      return result; // Allow component to get the result immediately
    } catch (err: any) {
      console.error("Error during mutation:", err);
      setError(err);
      throw err; // Re-throw to allow component to catch and handle in its own try/catch
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { data, loading, error, mutate };
}


// --- Specific Hooks for each API Endpoint ---

/**
 * Hook to create a new viewing request.
 * Returns a mutate function to trigger the creation.
 */
export const useCreateViewingRequest = () => {
  return useMutation<ViewingRequestResponse, ViewingRequestCreate>(createViewingRequest);
};

/**
 * Hook to retrieve all viewing requests made by the current user.
 * Provides data, loading, error, and refetch capabilities.
 */
export const useUserViewingRequests = () => {
  return useFetch<ViewingRequestResponse[]>(getUserViewingRequests, []);
};

/**
 * Hook to retrieve upcoming viewing requests for the current user.
 * Provides data, loading, error, and refetch capabilities.
 */
export const useUserUpcomingViewingRequests = () => {
  return useFetch<ViewingRequestResponse[]>(getUserUpcomingViewingRequests, []);
};

/**
 * Hook to update an existing viewing request.
 * Returns a mutate function to trigger the update.
 */
export const useUpdateViewingRequest = () => {
  // The mutationFn for update takes two arguments (requestId, data).
  // We wrap it to fit the useMutation signature which expects one argument (variables).
  return useMutation<ViewingRequestResponse, { requestId: number; data: ViewingRequestUpdate }>(
    ({ requestId, data }) => updateViewingRequest(requestId, data)
  );
};

/**
 * Hook to delete a viewing request.
 * Returns a mutate function to trigger the deletion.
 */
export const useDeleteViewingRequest = () => {
  return useMutation<SuccessMessageResponse, number>(deleteViewingRequest);
};

/**
 * Hook to accept a viewing request.
 * Returns a mutate function to trigger the acceptance.
 */
export const useAcceptViewingRequest = () => {
  return useMutation<ViewingRequestResponse, number>(acceptViewingRequest);
};

/**
 * Hook to deny a viewing request.
 * Returns a mutate function to trigger the denial.
 */
export const useDenyViewingRequest = () => {
  return useMutation<ViewingRequestResponse, number>(denyViewingRequest);
};

/**
 * Hook to retrieve all viewing requests for a specific property.
 * @param propertyId The ID of the property to fetch requests for.
 * Dependencies include propertyId, so the hook refetches if propertyId changes.
 */
export const usePropertyViewingRequests = (propertyId: number) => {
  return useFetch<ViewingRequestResponse[]>(() => getPropertyViewingRequests(propertyId), [], [propertyId]);
};

/**
 * Hook to retrieve all viewing requests for properties owned by the current user.
 */
export const useOwnerViewingRequests = () => {
  return useFetch<ViewingRequestResponse[]>(getOwnerViewingRequests, []);
};

/**
 * Hook to retrieve upcoming viewing requests for properties owned by the current user.
 */
export const useOwnerUpcomingViewingRequests = () => {
  return useFetch<ViewingRequestResponse[]>(getOwnerUpcomingViewingRequests, []);
};

/**
 * Hook to retrieve a specific viewing request by ID.
 * @param requestId The ID of the viewing request to fetch.
 * Dependencies include requestId, so the hook refetches if requestId changes.
 */
export const useViewingRequestById = (requestId: number) => {
  // Provide an initial empty object for a single viewing request to match its type.
  // The fetcher function itself will handle the case where the request might not exist or be loaded yet.
  return useFetch<ViewingRequestResponse>(() => getViewingRequestById(requestId), {} as ViewingRequestResponse, [requestId]);
};