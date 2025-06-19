// lib/hooks/useReviews.ts

import { useState, useEffect, useCallback } from 'react';
import {
  createReview,
  fetchMyReviews,
  fetchReviewsForProperty, // Assuming this utility now handles the new ReviewResponse type
  updateReviewStatus,
  deleteReview,
  ReviewCreate,
  ReviewResponse, // This should be the common interface for a review object
  ReviewStatusUpdate,
  ReviewStatusEnum,
} from '@/lib/utils/reviewFetcher'; // Ensure this path is correct for your project

// Re-exporting Review from reviewFetcher for consistency
export type { ReviewResponse as Review } from '@/lib/utils/reviewFetcher';


// TypeScript type for useCreateReview hook result
export type UseCreateReviewResult = {
  createReviewFn: (reviewData: ReviewCreate) => Promise<void>;
  createdReview: ReviewResponse | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * @function useCreateReview
 * @description A custom hook for creating a new review.
 * @returns {UseCreateReviewResult} An object containing the create review function, the created review data, loading state, and error state.
 */
export const useCreateReview = (): UseCreateReviewResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdReview, setCreatedReview] = useState<ReviewResponse | null>(null);

  const createReviewFn = useCallback(async (reviewData: ReviewCreate) => {
    setIsLoading(true);
    setError(null);
    setCreatedReview(null); // Clear previous successful creation data
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

  return { createReviewFn, createdReview, isLoading, error };
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
export type UseReviewsResult = { // Renamed for consistency if you're keeping the original hook name
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
export function useReviews(propertyId: string | number | null): UseReviewsResult {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  const getReviews = useCallback(async () => {
    // Check if propertyId is valid (not null, undefined, or an empty string if string type is allowed)
    if (propertyId === null || propertyId === undefined || (typeof propertyId === 'string' && propertyId.trim() === '') || (typeof propertyId === 'number' && isNaN(propertyId))) {
      setReviews([]);
      setIsLoadingReviews(false);
      setErrorReviews(null);
      return;
    }

    setIsLoadingReviews(true);
    setErrorReviews(null);
    try {
      // Ensure propertyId is a number before passing to fetchReviewsForProperty
      const numericPropertyId = typeof propertyId === 'string' ? parseInt(propertyId, 10) : propertyId;
      const data = await fetchReviewsForProperty(numericPropertyId);
      setReviews(data.filter((review: ReviewResponse) => review.status === ReviewStatusEnum.Approved));
    } catch (err: any) {
      console.error(`Failed to fetch reviews for property ${propertyId}:`, err);
      setErrorReviews(err.message || 'An unknown error occurred fetching reviews.');
    } finally {
      setIsLoadingReviews(false);
    }
  }, [propertyId]);

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  return { reviews, isLoadingReviews, errorReviews, refetchReviews: getReviews };
}

// TypeScript type for useUpdateReviewStatus hook result
export type UseUpdateReviewStatusResult = {
  updateStatusFn: (reviewId: number, statusData: ReviewStatusUpdate) => Promise<void>;
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
  const [updatedReview, setUpdatedReview] = useState<ReviewResponse | null>(null);

  const updateStatusFn = useCallback(async (reviewId: number, statusData: ReviewStatusUpdate) => {
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
  }, []);

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
  const [isDeletedSuccessfully, setIsDeletedSuccessfully] = useState<boolean>(false);
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