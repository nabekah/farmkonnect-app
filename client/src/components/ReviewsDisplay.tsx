import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

interface ReviewsDisplayProps {
  targetType: 'seller' | 'mentor' | 'equipment' | 'product';
  targetId: number;
}

export default function ReviewsDisplay({ targetType, targetId }: ReviewsDisplayProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch reviews
  const { data: reviewsData } = trpc.reviews.getReviews.useQuery({
    targetType,
    targetId,
    sortBy,
    limit: 20,
  });

  // Fetch ratings summary
  const ratingsQuery = {
    seller: () => trpc.reviews.getSellerRatings.useQuery({ sellerId: targetId }),
    mentor: () => trpc.reviews.getMentorRatings.useQuery({ mentorId: targetId }),
    equipment: () => trpc.reviews.getEquipmentRatings.useQuery({ equipmentId: targetId }),
    product: () => trpc.reviews.getSellerRatings.useQuery({ sellerId: targetId }),
  };

  const ratingsData = ratingsQuery[targetType]?.();

  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation();
  const replyMutation = trpc.reviews.replyToReview.useMutation();

  const handleMarkHelpful = async (reviewId: number) => {
    await markHelpfulMutation.mutateAsync({
      reviewId,
      helpful: true,
    });
  };

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) return;
    
    await replyMutation.mutateAsync({
      reviewId,
      comment: replyText,
    });
    
    setReplyText('');
    setShowReplyForm(null);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingsData?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {ratingsData.data.overallRating}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(ratingsData.data.overallRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{ratingsData.data.totalReviews} reviews</p>
              </div>

              {/* Category Ratings */}
              {ratingsData.data.categories.map((category: any) => (
                <div key={category.category}>
                  <p className="text-sm font-medium text-gray-900 mb-2">{category.category}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(category.rating / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8">{category.rating}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Badges */}
            {ratingsData.data.badges && (
              <div className="flex flex-wrap gap-2 mt-6">
                {ratingsData.data.badges.map((badge: any) => (
                  <Badge key={badge.name} variant="secondary">
                    {badge.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Reviews</CardTitle>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviewsData?.reviews.map((review: any) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {review.reviewer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.reviewer.name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-3">
                {review.verifiedPurchase && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Verified Purchase
                  </Badge>
                )}
              </div>

              {/* Review Title and Comment */}
              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-600 mb-3">{review.comment}</p>

              {/* Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.photos.map((photo: string, idx: number) => (
                    <div
                      key={idx}
                      className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500"
                    >
                      Photo {idx + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Voting */}
              <div className="flex items-center gap-4 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-600 hover:text-blue-600"
                  onClick={() => handleMarkHelpful(review.id)}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-600 hover:text-red-600"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Not helpful ({review.unhelpful})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-600 hover:text-red-600 ml-auto"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </Button>
              </div>

              {/* Seller Response */}
              {review.response && (
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    Response from {review.response.author}
                  </p>
                  <p className="text-sm text-blue-800">{review.response.comment}</p>
                </div>
              )}

              {/* Reply Form */}
              {showReplyForm === review.id ? (
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(review.id)}
                      disabled={!replyText.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReplyForm(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-600"
                  onClick={() => setShowReplyForm(review.id)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Reply
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
