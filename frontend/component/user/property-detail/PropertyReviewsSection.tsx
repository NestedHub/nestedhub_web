// component/user/property-detail/PropertyReviewsSection.tsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/component/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/component/ui/avatar";
import { Button } from "@/component/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Corrected path based on v1's component/ui
import { Label } from "@/component/ui/label";
import { Slider } from "@/components/ui/slider"; // Corrected path based on v1's component/ui
import { Loader2, Star } from "lucide-react";

// Import types and hooks from your lib
import { ReviewResponse, ReviewCreate } from '@/lib/utils/reviewFetcher';
import { usePublicUser } from "@/lib/hooks/usePublicUser";
import { useReviews, useCreateReview } from '@/lib/hooks/useReviews'; // Both hooks from the same file

// Helper functions (assuming these exist and are correct)
import { formatDate } from "@/lib/utils/helpers"; // Assuming formatDate is here
import { renderStars } from "@/lib/utils/helpers"; // Assuming renderStars is here, if not, keep it locally or define it there

// --- Sub-component for a single review item ---
interface ReviewItemProps {
  review: ReviewResponse; // Use ReviewResponse for consistency as established in the merged hook
}

function ReviewItem({ review }: ReviewItemProps) {
  const { publicUser: reviewer, isLoadingPublicUser: isLoadingReviewer } = usePublicUser(review.user_id);

  return (
    <Card key={review.review_id} className="border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            {isLoadingReviewer ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <AvatarImage src={reviewer?.profile_picture_url || `https://api.dicebear.com/7.x/initials/svg?seed=${reviewer?.name || review.user_id}`} />
            )}
            <AvatarFallback>
              {isLoadingReviewer ? "" : reviewer?.name ? reviewer.name[0].toUpperCase() : String(review.user_id)[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">
                {isLoadingReviewer ? "Loading user..." : reviewer?.name || `User ${review.user_id}`}
              </span>
              <div className="flex">
                {renderStars(review.rating)}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {review.comment}
            </p>
            <span className="text-xs text-gray-500 mt-2 block">Reviewed on {formatDate(review.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main component: PropertyReviewsSection ---
interface PropertyReviewsSectionProps {
  propertyId: number; // The ID of the property to fetch reviews for and to submit new reviews
  isAuthenticated: boolean; // Prop to indicate if the user is logged in
}

export function PropertyReviewsSection({ propertyId, isAuthenticated }: PropertyReviewsSectionProps) {
  // Use the useReviews hook to fetch reviews for this property
  const { reviews, isLoadingReviews, errorReviews, refetchReviews } = useReviews(propertyId);

  // State for the new review form
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5); // Default to 5 stars

  // Use the useCreateReview hook for submitting new reviews
  const { createReviewFn, isLoading: isCreatingReview, error: createReviewError, createdReview } = useCreateReview();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to leave a review.");
      return;
    }
    if (!newComment.trim() || newRating < 1 || newRating > 5) {
      alert("Please provide a comment and a rating between 1 and 5.");
      return;
    }

    const reviewData: ReviewCreate = {
      property_id: propertyId,
      rating: newRating,
      comment: newComment.trim(),
    };

    try {
      await createReviewFn(reviewData);
      setNewComment(''); // Clear the form
      setNewRating(5); // Reset rating

      // IMPORTANT: Refetch reviews to include the newly submitted one (if approved)
      refetchReviews();
    } catch (error: any) {
      console.error("Failed to submit review in component:", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Rating and Reviews</h2>

      {/* Section to Leave a Review */}
      {isAuthenticated ? (
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <Label htmlFor="rating" className="block text-sm font-medium text-gray-700">Your Rating:</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Slider
                    id="rating"
                    min={1}
                    max={5}
                    step={1}
                    value={[newRating]}
                    onValueChange={(val) => setNewRating(val[0])}
                    className="w-[150px]"
                  />
                  <span className="text-lg font-bold">{newRating} <Star className="inline-block w-5 h-5 text-yellow-400 fill-yellow-400" /></span>
                </div>
              </div>
              <div>
                <Label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Comment:</Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              {createReviewError && <p className="text-red-500 text-sm mt-2">Error submitting review: {createReviewError.message}</p>}
              {createdReview && (
                  <p className="text-green-600 text-sm mt-2">
                      Review submitted successfully! It will appear after moderation.
                  </p>
              )}
              <Button type="submit" disabled={isCreatingReview}>
                {isCreatingReview ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <p className="mb-6 text-gray-700">Please <a href="/login" className="text-blue-600 hover:underline">log in</a> to leave a review for this property.</p>
      )}

      {/* Section for displaying existing reviews */}
      <h3 className="text-xl font-semibold mb-3 text-gray-700">All Approved Reviews</h3>
      {isLoadingReviews ? (
        <div className="flex items-center text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading reviews...
        </div>
      ) : errorReviews ? (
        <p className="text-red-500 text-sm">Error loading reviews: {errorReviews}</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-700">Currently, no approved reviews are available for this property.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem key={review.review_id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}