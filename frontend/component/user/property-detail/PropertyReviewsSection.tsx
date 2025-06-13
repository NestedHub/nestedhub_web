// component/user/property-detail/PropertyReviewsSection.tsx
import { Card, CardContent } from "@/component/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/component/ui/avatar";
import { Loader2, Star } from "lucide-react";
import { Review } from '@/lib/types';
import { formatDate, renderStars } from "@/lib/utils/helpers";
import { usePublicUser } from "@/lib/hooks/usePublicUser"; // Assuming this hook exists and fetches public user data

interface PropertyReviewsSectionProps {
  reviews: Review[];
  isLoadingReviews: boolean;
  errorReviews: string | null;
}

// Sub-component for a single review item to encapsulate user fetching
function ReviewItem({ review }: { review: Review }) {
  // CORRECTED: Destructure isLoadingPublicUser from the hook
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

export function PropertyReviewsSection({ reviews, isLoadingReviews, errorReviews }: PropertyReviewsSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Rating and Reviews</h2>
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