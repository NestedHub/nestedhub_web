// lib/hooks/useReviews.ts
import { useState, useEffect } from 'react';
import { fetchReviewsForProperty } from '@/lib/utils/api';

export interface Review {
  review_id: number;
  user_id: number;
  property_id: number;
  rating: number; // Assuming this is a number 0-5
  comment: string;
  status: string;
  created_at: string;
}

interface UseReviewsResult {
  reviews: Review[];
  isLoadingReviews: boolean;
  errorReviews: string | null;
}

export function useReviews(propertyId: string): UseReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setReviews([]);
      setIsLoadingReviews(false);
      return;
    }

    const getReviews = async () => {
      setIsLoadingReviews(true);
      setErrorReviews(null);
      try {
        const data = await fetchReviewsForProperty(propertyId);
        // Filter for 'approved' reviews if your API doesn't do it automatically
        setReviews(data.filter((review: Review) => review.status === 'approved'));
      } catch (err: any) {
        console.error("Failed to fetch reviews:", err);
        setErrorReviews(err.message || 'An unknown error occurred fetching reviews');
      } finally {
        setIsLoadingReviews(false);
      }
    };

    getReviews();
  }, [propertyId]);

  return { reviews, isLoadingReviews, errorReviews };
}