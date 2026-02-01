import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

interface ProductReviewsSectionProps {
  productId: number;
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: reviews = [], isLoading } = trpc.marketplace.getProductReviews.useQuery({ productId });
  
  const createReview = trpc.marketplace.createProductReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      setShowForm(false);
      utils.marketplace.getProductReviews.invalidate({ productId });
      utils.marketplace.getProduct.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  const markHelpful = trpc.marketplace.markReviewHelpful.useMutation({
    onSuccess: () => {
      utils.marketplace.getProductReviews.invalidate({ productId });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    createReview.mutate({
      productId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
            <div className="flex justify-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-8">{star} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full mt-4">
            Write a Review
          </Button>
        )}
      </Card>

      {/* Review Form */}
      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Write Your Review</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmit} 
                disabled={createReview.isPending}
              >
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {review.comment && (
                <p className="text-sm mt-2 mb-3">{review.comment}</p>
              )}

              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => markHelpful.mutate({ reviewId: review.id })}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
