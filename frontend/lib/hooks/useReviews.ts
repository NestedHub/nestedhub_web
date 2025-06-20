// lib/hooks/useReviews.ts

import { useState, useEffect, useCallback } from "react";
import {
  createReview,
  fetchMyReviews,
  fetchReviewsForProperty,
  updateReviewStatus,
  deleteReview,
  ReviewCreate,
  ReviewResponse,
  ReviewStatusUpdate,
  ReviewStatusEnum,
} from "@/lib/utils/reviewFetcher";

// Re-exporting Review from reviewFetcher for consistency
export type { ReviewResponse as Review } from "@/lib/utils/reviewFetcher";

// TypeScript type for useCreateReview hook result
export type UseCreateReviewResult = {
  createReviewFn: (reviewData: ReviewCreate) => Promise<void>;
  createdReview: ReviewResponse | null;
  isLoading: boolean;
  error: Error | null;
  resetState: () => void; // Added resetState
};

/**
 * @function useCreateReview
 * @description A custom hook for creating a new review.
 * @returns {UseCreateReviewResult} An object containing the create review function, the created review data, loading state, error state, and a function to reset the hook's state.
 */
export const useCreateReview = (): UseCreateReviewResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdReview, setCreatedReview] = useState<ReviewResponse | null>(
    null
  );

  // New function to reset the state of this hook
  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setCreatedReview(null);
  }, []);

  const createReviewFn = useCallback(async (reviewData: ReviewCreate) => {
    setIsLoading(true);
    setError(null); // Clear error before new attempt
    setCreatedReview(null); // Clear previous successful creation data before new attempt
    try {
      const response = await createReview(reviewData);
      setCreatedReview(response);
    } catch (err: any) {
      console.error("Error creating review:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createReviewFn, createdReview, isLoading, error, resetState };
};

// TypeScript type for useMyReviews hook result
export type UseMyReviewsResult = {
  reviews: ReviewResponse[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * @function useMyReviews
 * @description A custom hook for fetching reviews made by the currently authenticated user.
 * @returns {UseMyReviewsResult} An object containing the user's reviews, loading state, error state, and a refetch function.
 */
export const useMyReviews = (): UseMyReviewsResult => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyReviews();
      setReviews(data);
    } catch (err: any) {
      console.error("Error fetching user reviews:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, isLoading, error, refetch: fetchReviews };
};

// TypeScript type for useReviews (for property) hook result
export type UseReviewsResult = {
  reviews: ReviewResponse[];
  isLoadingReviews: boolean;
  errorReviews: string | null;
  refetchReviews: () => Promise<void>;
};

/**
 * @function useReviews
 * @description A custom hook for fetching and managing approved reviews for a specific property.
 * @param {string | number | null} propertyId - The ID of the property to fetch reviews for. Pass null or undefined to prevent fetching.
 * @returns {UseReviewsResult} An object containing the approved reviews, loading state, error state, and a refetch function.
 */
export function useReviews(
  propertyId: string | number | null
): UseReviewsResult {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  console.log(`[useReviews Hook] Initial propertyId received: ${propertyId}`);

  const getReviews = useCallback(async () => {
    console.log(
      `[useReviews Hook] getReviews useCallback triggered. propertyId: ${propertyId}`
    );

    if (
      propertyId === null ||
      propertyId === undefined ||
      (typeof propertyId === "string" && propertyId.trim() === "") ||
      (typeof propertyId === "number" && isNaN(propertyId))
    ) {
      console.warn(
        `[useReviews Hook] Invalid propertyId detected: ${propertyId}. Skipping fetch.`
      );
      setReviews([]);
      setIsLoadingReviews(false);
      setErrorReviews(null);
      return;
    }

    setIsLoadingReviews(true);
    setErrorReviews(null);
    try {
      const numericPropertyId =
        typeof propertyId === "string" ? parseInt(propertyId, 10) : propertyId;
      console.log(
        `[useReviews Hook] Preparing to call fetchReviewsForProperty with numericPropertyId: ${numericPropertyId}`
      );

      const data = await fetchReviewsForProperty(numericPropertyId);
      console.log(
        `[useReviews Hook] Successfully fetched raw reviews data:`,
        data
      );

      const approvedReviews = data.filter(
        (review: ReviewResponse) => review.status === ReviewStatusEnum.Approved
      );
      console.log(
        `[useReviews Hook] Filtered approved reviews:`,
        approvedReviews
      );

      setReviews(approvedReviews);
    } catch (err: any) {
      console.error(
        `[useReviews Hook] Error fetching reviews for property ${propertyId}:`,
        err
      );
      setErrorReviews(
        err.message || "An unknown error occurred fetching reviews."
      );
    } finally {
      setIsLoadingReviews(false);
      console.log(
        `[useReviews Hook] Finished fetching reviews for propertyId: ${propertyId}. Loading state: ${false}`
      );
    }
  }, [propertyId]);

  useEffect(() => {
    console.log(`[useReviews Hook] useEffect triggered. Calling getReviews().`);
    getReviews();
  }, [getReviews]);

  return {
    reviews,
    isLoadingReviews,
    errorReviews,
    refetchReviews: getReviews,
  };
}

// TypeScript type for useUpdateReviewStatus hook result
export type UseUpdateReviewStatusResult = {
  updateStatusFn: (
    reviewId: number,
    statusData: ReviewStatusUpdate
  ) => Promise<void>;
  updatedReview: ReviewResponse | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * @function useUpdateReviewStatus
 * @description A custom hook for updating the status of an existing review.
 * @returns {UseUpdateReviewStatusResult} An object containing the update status function, the updated review data, loading state, and error state.
 */
export const useUpdateReviewStatus = (): UseUpdateReviewStatusResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedReview, setUpdatedReview] = useState<ReviewResponse | null>(
    null
  );

  const updateStatusFn = useCallback(
    async (reviewId: number, statusData: ReviewStatusUpdate) => {
      setIsLoading(true);
      setError(null);
      setUpdatedReview(null);
      try {
        const response = await updateReviewStatus(reviewId, statusData);
        setUpdatedReview(response);
      } catch (err: any) {
        console.error(`Error updating status for review ${reviewId}:`, err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { updateStatusFn, updatedReview, isLoading, error };
};

// TypeScript type for useDeleteReview hook result
export type UseDeleteReviewResult = {
  deleteReviewFn: (reviewId: number) => Promise<void>;
  isDeleting: boolean;
  isDeletedSuccessfully: boolean;
  error: Error | null;
};

/**
 * @function useDeleteReview
 * @description A custom hook for deleting a review.
 * @returns {UseDeleteReviewResult} An object containing the delete review function, deletion status, and error state.
 */
export const useDeleteReview = (): UseDeleteReviewResult => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeletedSuccessfully, setIsDeletedSuccessfully] =
    useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteReviewFn = useCallback(async (reviewId: number) => {
    setIsDeleting(true);
    setIsDeletedSuccessfully(false);
    setError(null);
    try {
      await deleteReview(reviewId);
      setIsDeletedSuccessfully(true);
    } catch (err: any) {
      console.error(`Error deleting review ${reviewId}:`, err);
      setError(err);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteReviewFn, isDeleting, isDeletedSuccessfully, error };
};