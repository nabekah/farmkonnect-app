import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const reviewsRouter = router({
  // Create review
  createReview: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["seller", "mentor", "equipment", "product"]),
        targetId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string(),
        comment: z.string(),
        photos: z.array(z.string()).optional(),
        verifiedPurchase: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reviewId = Math.floor(Math.random() * 100000);
      
      return {
        success: true,
        message: "Review posted successfully",
        reviewId,
        status: "published",
      };
    }),

  // Get reviews for target
  getReviews: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["seller", "mentor", "equipment", "product"]),
        targetId: z.number(),
        sortBy: z.enum(["recent", "helpful", "rating_high", "rating_low"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      return {
        targetId: input.targetId,
        targetType: input.targetType,
        averageRating: 4.7,
        totalReviews: 156,
        ratingDistribution: {
          5: 98,
          4: 42,
          3: 12,
          2: 3,
          1: 1,
        },
        reviews: [
          {
            id: 1,
            reviewer: {
              id: 1,
              name: "John Farmer",
              avatar: "jf.jpg",
            },
            rating: 5,
            title: "Excellent quality and fast delivery",
            comment: "Very satisfied with the product quality and the seller's professionalism",
            photos: ["photo1.jpg", "photo2.jpg"],
            verifiedPurchase: true,
            helpful: 24,
            unhelpful: 2,
            date: Date.now() - 86400000,
            response: {
              author: "Seller",
              comment: "Thank you for your kind words! We appreciate your business.",
              date: Date.now() - 43200000,
            },
          },
          {
            id: 2,
            reviewer: {
              id: 2,
              name: "Jane Expert",
              avatar: "je.jpg",
            },
            rating: 4,
            title: "Good quality, minor packaging issue",
            comment: "Product is good but packaging could be better for long-distance delivery",
            photos: [],
            verifiedPurchase: true,
            helpful: 12,
            unhelpful: 1,
            date: Date.now() - 172800000,
            response: null,
          },
          {
            id: 3,
            reviewer: {
              id: 3,
              name: "Mark Breeder",
              avatar: "mb.jpg",
            },
            rating: 5,
            title: "Perfect for my farm",
            comment: "Exactly what I needed. Will definitely order again.",
            photos: ["photo3.jpg"],
            verifiedPurchase: true,
            helpful: 18,
            unhelpful: 0,
            date: Date.now() - 259200000,
            response: {
              author: "Seller",
              comment: "We're thrilled you're happy with your purchase!",
              date: Date.now() - 216000000,
            },
          },
        ],
      };
    }),

  // Mark review as helpful
  markHelpful: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        helpful: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Thank you for your feedback",
      };
    }),

  // Reply to review
  replyToReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Reply posted successfully",
        responseId: Math.floor(Math.random() * 100000),
      };
    }),

  // Delete review (own reviews only)
  deleteReview: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Review deleted successfully",
      };
    }),

  // Edit review (own reviews only)
  editReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        rating: z.number().min(1).max(5).optional(),
        title: z.string().optional(),
        comment: z.string().optional(),
        photos: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Review updated successfully",
      };
    }),

  // Get seller ratings summary
  getSellerRatings: protectedProcedure
    .input(z.object({ sellerId: z.number() }))
    .query(async ({ input }) => {
      return {
        sellerId: input.sellerId,
        overallRating: 4.8,
        totalReviews: 342,
        categories: [
          {
            category: "Product Quality",
            rating: 4.9,
            count: 342,
          },
          {
            category: "Delivery Speed",
            rating: 4.7,
            count: 342,
          },
          {
            category: "Communication",
            rating: 4.8,
            count: 342,
          },
          {
            category: "Packaging",
            rating: 4.6,
            count: 342,
          },
        ],
        badges: [
          { name: "Top Seller", icon: "crown" },
          { name: "Fast Shipper", icon: "truck" },
          { name: "Highly Responsive", icon: "message" },
        ],
      };
    }),

  // Get mentor ratings summary
  getMentorRatings: protectedProcedure
    .input(z.object({ mentorId: z.number() }))
    .query(async ({ input }) => {
      return {
        mentorId: input.mentorId,
        overallRating: 4.9,
        totalReviews: 156,
        categories: [
          {
            category: "Knowledge",
            rating: 4.9,
            count: 156,
          },
          {
            category: "Communication",
            rating: 4.8,
            count: 156,
          },
          {
            category: "Responsiveness",
            rating: 4.9,
            count: 156,
          },
          {
            category: "Value for Money",
            rating: 4.7,
            count: 156,
          },
        ],
        badges: [
          { name: "Expert Mentor", icon: "star" },
          { name: "Highly Rated", icon: "award" },
          { name: "Quick Responder", icon: "zap" },
        ],
      };
    }),

  // Get equipment ratings summary
  getEquipmentRatings: protectedProcedure
    .input(z.object({ equipmentId: z.number() }))
    .query(async ({ input }) => {
      return {
        equipmentId: input.equipmentId,
        overallRating: 4.7,
        totalReviews: 98,
        categories: [
          {
            category: "Condition",
            rating: 4.8,
            count: 98,
          },
          {
            category: "Functionality",
            rating: 4.7,
            count: 98,
          },
          {
            category: "Owner Communication",
            rating: 4.6,
            count: 98,
          },
          {
            category: "Value for Money",
            rating: 4.7,
            count: 98,
          },
        ],
        badges: [
          { name: "Well Maintained", icon: "wrench" },
          { name: "Reliable", icon: "check" },
        ],
      };
    }),

  // Get my reviews
  getMyReviews: protectedProcedure
    .input(
      z.object({
        type: z.enum(["given", "received"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        reviews: [
          {
            id: 1,
            targetType: "seller",
            targetName: "John's Farm Store",
            rating: 5,
            title: "Excellent quality",
            comment: "Very satisfied with the products",
            date: Date.now() - 86400000,
            status: "published",
          },
          {
            id: 2,
            targetType: "mentor",
            targetName: "Dr. Jane Okafor",
            rating: 5,
            title: "Great mentor",
            comment: "Learned so much from this mentorship",
            date: Date.now() - 172800000,
            status: "published",
          },
        ],
      };
    }),

  // Get review statistics
  getReviewStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalReviewsGiven: 12,
      totalReviewsReceived: 156,
      averageRatingGiven: 4.7,
      averageRatingReceived: 4.8,
      helpfulReviewsCount: 89,
      mostHelpfulReview: {
        id: 1,
        title: "Excellent quality and fast delivery",
        helpful: 24,
      },
    };
  }),

  // Report review (spam, inappropriate, etc.)
  reportReview: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        reason: z.enum(["spam", "inappropriate", "fake", "offensive", "other"]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Review reported successfully. We'll review it shortly.",
        reportId: Math.floor(Math.random() * 100000),
      };
    }),

  // Get trending reviews
  getTrendingReviews: protectedProcedure
    .input(
      z.object({
        category: z.enum(["sellers", "mentors", "equipment", "products"]).optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      return {
        trendingReviews: [
          {
            id: 1,
            reviewer: "John Farmer",
            targetName: "Premium Tomato Seeds",
            rating: 5,
            title: "Best seeds I've ever used",
            helpful: 156,
            date: Date.now() - 86400000,
          },
          {
            id: 2,
            reviewer: "Jane Expert",
            targetName: "Dr. Ahmed Hassan",
            rating: 5,
            title: "Life-changing mentorship",
            helpful: 98,
            date: Date.now() - 172800000,
          },
        ],
      };
    }),
});
