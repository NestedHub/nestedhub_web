// component/user/property-detail/PropertyReviewsSection.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/component/ui/avatar";
import { Button } from "@/component/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/component/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Star, Trash2 } from "lucide-react";

// Import Dialog components from your UI library (e.g., Shadcn UI)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Adjust path as per your project structure

// Import types and hooks from your lib
import { ReviewResponse, ReviewCreate, ReviewStatusEnum } from "@/lib/utils/reviewFetcher";
import { usePublicUser } from "@/lib/hooks/usePublicUser";
import { useReviews, useCreateReview, useMyReviews, useDeleteReview } from "@/lib/hooks/useReviews";

// Helper functions
import { formatDate } from "@/lib/utils/helpers";
import { renderStars } from "@/lib/utils/helpers";

// --- Sub-component for a single review item ---
interface ReviewItemProps {
  review: ReviewResponse;
  isCurrentUserReview?: boolean;
  onDeleteClick?: (reviewId: number) => void; // Changed name to indicate it triggers dialog
}

function ReviewItem({ review, isCurrentUserReview = false, onDeleteClick }: ReviewItemProps) {
  const { publicUser: reviewer, isLoadingPublicUser: isLoadingReviewer } =
    usePublicUser(review.user_id);

  return (
    <Card key={review.review_id} className="border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            {isLoadingReviewer ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              <AvatarImage
                src={
                  reviewer?.profile_picture_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${
                    reviewer?.name || review.user_id
                  }`
                }
              />
            )}
            <AvatarFallback>
              {isLoadingReviewer
                ? ""
                : reviewer?.name
                ? reviewer.name[0].toUpperCase()
                : String(review.user_id)[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">
                {isLoadingReviewer
                  ? "Loading user..."
                  : reviewer?.name || `User ${review.user_id}`}
              </span>
              <div className="flex items-center">
                {renderStars(review.rating)}
                {isCurrentUserReview && review.status === ReviewStatusEnum.Pending && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    Pending
                  </span>
                )}
                {isCurrentUserReview && onDeleteClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(review.review_id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Delete Review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {/* Add Edit button if API for content edit becomes available */}
                {/* {isCurrentUserReview && onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(review)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    title="Edit Review"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )} */}
              </div>
            </div>
            <p className="text-sm text-gray-600">{review.comment}</p>
            <span className="text-xs text-gray-500 mt-2 block">
              Reviewed on {formatDate(review.created_at)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main component: PropertyReviewsSection ---
interface PropertyReviewsSectionProps {
  propertyId: number;
  isAuthenticated: boolean;
}

export function PropertyReviewsSection({
  propertyId,
  isAuthenticated,
}: PropertyReviewsSectionProps) {
  // State for new review form
  const [newComment, setNewComment] = useState<string>("");
  const [newRating, setNewRating] = useState<number>(5);

  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<number | null>(null);

  // State for general purpose message dialogs
  const [showMessageDialog, setShowMessageDialog] = useState<boolean>(false);
  const [messageDialogTitle, setMessageDialogTitle] = useState<string>("");
  const [messageDialogDescription, setMessageDialogDescription] = useState<string>("");
  const [isErrorDialog, setIsErrorDialog] = useState<boolean>(false); // To style error messages differently


  useEffect(() => {
    console.log(
      `[PropertyReviewsSection] Component mounted/re-rendered with propertyId: ${propertyId}, isAuthenticated: ${isAuthenticated}`
    );
  }, [propertyId, isAuthenticated]);

  // Hook for publicly approved reviews
  const { reviews, isLoadingReviews, errorReviews, refetchReviews } =
    useReviews(propertyId);

  // Hook for current user's reviews (including pending ones)
  const { reviews: myReviews, isLoading: isLoadingMyReviews, error: errorMyReviews, refetch: refetchMyReviews } =
    useMyReviews();

  // Hook for creating reviews
  const {
    createReviewFn,
    isLoading: isCreatingReview,
    error: createReviewError,
    createdReview,
    resetState: resetCreateReviewState
  } = useCreateReview();

  // Hook for deleting reviews
  const {
    deleteReviewFn,
    isDeleting,
    isDeletedSuccessfully,
    error: deleteReviewError
  } = useDeleteReview();


  // Find the pending review for this specific property by the current user
  const userPendingReview = myReviews?.find(
    (review) =>
      review.property_id === propertyId && review.status === ReviewStatusEnum.Pending
  );

  // Log state updates
  useEffect(() => {
    console.log(`[PropertyReviewsSection] useReviews hook state updated:`, { isLoadingReviews, errorReviews, reviewsCount: reviews?.length });
  }, [reviews, isLoadingReviews, errorReviews]);

  useEffect(() => {
    console.log(`[PropertyReviewsSection] useMyReviews hook state updated:`, { isLoadingMyReviews, errorMyReviews, myReviewsCount: myReviews?.length });
    if (userPendingReview) {
      console.log("[PropertyReviewsSection] User has a pending review for this property:", userPendingReview);
    }
  }, [myReviews, isLoadingMyReviews, errorMyReviews, userPendingReview]);

  useEffect(() => {
    console.log(`[PropertyReviewsSection] useCreateReview hook state updated:`, { isCreatingReview, createReviewError, createdReview });
    if (createdReview) {
      setMessageDialogTitle("Review Submitted");
      setMessageDialogDescription("Your review has been submitted successfully and is awaiting moderation.");
      setIsErrorDialog(false);
      setShowMessageDialog(true);
      refetchMyReviews(); // Refetch user's reviews to show the newly pending one
      setNewComment(""); // Clear form after successful submission
      setNewRating(5); // Reset rating
    }
    if (createReviewError) {
      setMessageDialogTitle("Submission Failed");
      setMessageDialogDescription(`Failed to submit review: ${createReviewError.message || "An unknown error occurred."}`);
      setIsErrorDialog(true);
      setShowMessageDialog(true);
    }
  }, [isCreatingReview, createReviewError, createdReview, refetchMyReviews]);

  useEffect(() => {
    console.log(`[PropertyReviewsSection] useDeleteReview hook state updated:`, { isDeleting, isDeletedSuccessfully, deleteReviewError });
    if (isDeletedSuccessfully) {
      setMessageDialogTitle("Review Deleted");
      setMessageDialogDescription("Your review has been successfully deleted.");
      setIsErrorDialog(false);
      setShowMessageDialog(true);
      refetchMyReviews(); // Refetch user's reviews after successful deletion
      setShowDeleteDialog(false); // Close the dialog on success
      setReviewToDeleteId(null); // Clear the review ID
    }
    if (deleteReviewError) {
      setMessageDialogTitle("Deletion Failed");
      setMessageDialogDescription(`Failed to delete review: ${deleteReviewError.message || "An unknown error occurred."}`);
      setIsErrorDialog(true);
      setShowMessageDialog(true);
      setShowDeleteDialog(false); // Close the dialog on error
      setReviewToDeleteId(null); // Clear the review ID
    }
  }, [isDeleting, isDeletedSuccessfully, deleteReviewError, refetchMyReviews]);


  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[PropertyReviewsSection] handleReviewSubmit called.");

    if (!isAuthenticated) {
      setMessageDialogTitle("Authentication Required");
      setMessageDialogDescription("Please log in to leave a review.");
      setIsErrorDialog(true);
      setShowMessageDialog(true);
      return;
    }
    if (!newComment.trim() || newRating < 1 || newRating > 5) {
      setMessageDialogTitle("Invalid Input");
      setMessageDialogDescription("Please provide a comment and a rating between 1 and 5.");
      setIsErrorDialog(true);
      setShowMessageDialog(true);
      return;
    }

    // If a pending review already exists, prevent new submission for this property
    if (userPendingReview) {
      setMessageDialogTitle("Pending Review Exists");
      setMessageDialogDescription("You already have a pending review for this property. Please wait for moderation or delete your existing review to submit a new one.");
      setIsErrorDialog(false); // Not an error, just a notice
      setShowMessageDialog(true);
      return;
    }

    const reviewData: ReviewCreate = {
      property_id: propertyId,
      rating: newRating,
      comment: newComment.trim(),
    };
    console.log(
      "[PropertyReviewsSection] Preparing review data for submission:",
      reviewData
    );

    try {
      await createReviewFn(reviewData);
      console.log(
        "[PropertyReviewsSection] createReviewFn successfully called. State update will handle dialog."
      );
      // State updates for success/error are handled in useEffect for createReviewFn
    } catch (error: any) {
      console.error(
        "[PropertyReviewsSection] Failed to initiate review submission in component catch block (error handled by hook's useEffect):",
        error
      );
      // The error dialog will be shown by the useEffect watching createReviewError
    }
  };

  // Function called when the delete button is clicked in ReviewItem
  const handleDeleteClick = (reviewId: number) => {
    setReviewToDeleteId(reviewId);
    setShowDeleteDialog(true); // Open the dialog
  };

  // Function called when user confirms deletion in the dialog
  const handleConfirmDelete = async () => {
    if (reviewToDeleteId === null) return; // Should not happen if dialog is opened correctly

    console.log(`[PropertyReviewsSection] Confirming delete for review ID: ${reviewToDeleteId}`);
    try {
      await deleteReviewFn(reviewToDeleteId);
      // Success/Error handling is now in the useEffect for deleteReviewFn
    } catch (error) {
      // Error is caught by the useEffect, so no need for a local alert here
      console.error("Error initiating delete from dialog:", error);
    }
  };

  // Effect to reset create review state when comment or rating changes,
  // or after a successful creation/error, so the next submission is clean.
  useEffect(() => {
    if (createdReview || createReviewError) {
      resetCreateReviewState();
    }
  }, [newComment, newRating, resetCreateReviewState, createdReview, createReviewError]);


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Rating and Reviews
      </h2>

      {/* Section to Leave a Review */}
      {isAuthenticated ? (
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              Leave a Review
            </h3>
            {userPendingReview ? (
                <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-md mb-4">
                    <p className="font-semibold text-yellow-800 mb-2">
                        You have a pending review for this property.
                    </p>
                    <ReviewItem
                        review={userPendingReview}
                        isCurrentUserReview={true}
                        onDeleteClick={handleDeleteClick} // Pass the new handler
                    />
                    <p className="text-sm text-yellow-700 mt-2">
                        It will appear in the "All Approved Reviews" section after moderation.
                        You can delete it above if you wish to submit a new one.
                    </p>
                </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="rating"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Rating:
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Slider
                      id="rating"
                      min={1}
                      max={5}
                      step={1}
                      value={[newRating]}
                      onValueChange={(val) => {
                        setNewRating(val[0]);
                      }}
                      className="w-[150px]"
                    />
                    <span className="text-lg font-bold">
                      {newRating}{" "}
                      <Star className="inline-block w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </span>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Comment:
                  </Label>
                  <Textarea
                    id="comment"
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                    }}
                    placeholder="Share your experience..."
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                </div>
                {/* These messages will now be handled by the dialog */}
                {/* {createReviewError && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    Error submitting review: {createReviewError.message}. Please try again.
                  </p>
                )}
                {createdReview && (
                  <p className="text-green-600 text-base mt-2 font-semibold">
                    &#10003; Review submitted successfully! It will appear after moderation.
                  </p>
                )} */}
                <Button type="submit" disabled={isCreatingReview}>
                  {isCreatingReview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="mb-6 text-gray-700">
          Please{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            log in
          </a>{" "}
          to leave a review for this property.
        </p>
      )}

      {/* Section for displaying existing reviews */}
      <h3 className="text-xl font-semibold mb-3 text-gray-700">
        All Approved Reviews
      </h3>
      {isLoadingReviews ? (
        <div className="flex items-center text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading reviews...
        </div>
      ) : errorReviews ? (
        <p className="text-red-500 text-sm">
          Error loading reviews: {errorReviews}
        </p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-700">
          Currently, no approved reviews are available for this property.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem key={review.review_id} review={review} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setReviewToDeleteId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={isErrorDialog ? "text-red-600" : ""}>
              {messageDialogTitle}
            </DialogTitle>
            <DialogDescription>
              {messageDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowMessageDialog(false)}>
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}