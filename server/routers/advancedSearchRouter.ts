import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const advancedSearchRouter = router({
  // Search marketplace products with advanced filters
  searchMarketplaceProducts: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        cropType: z.array(z.string()).optional(),
        priceRange: z
          .object({
            min: z.number().optional(),
            max: z.number().optional(),
          })
          .optional(),
        rating: z.number().min(0).max(5).optional(),
        location: z.string().optional(),
        sortBy: z.enum(["relevance", "price_asc", "price_desc", "rating", "newest"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        // Mock search results - in real app, use full-text search with database
        const mockProducts = [
          {
            id: 1,
            name: "Fresh Tomatoes",
            price: 5000,
            rating: 4.8,
            reviews: 156,
            location: "Ashanti Region",
            seller: "Green Valley Farm",
            quantity: "50 kg",
            cropType: "vegetables",
            image: "tomatoes.jpg",
            inStock: true,
            createdAt: new Date(),
          },
          {
            id: 2,
            name: "Organic Rice",
            price: 8000,
            rating: 4.9,
            reviews: 203,
            location: "Northern Region",
            seller: "Rice Farmers Co.",
            quantity: "100 kg",
            cropType: "grains",
            image: "rice.jpg",
            inStock: true,
            createdAt: new Date(),
          },
          {
            id: 3,
            name: "Cassava Flour",
            price: 3500,
            rating: 4.5,
            reviews: 89,
            location: "Western Region",
            seller: "Local Mills",
            quantity: "25 kg",
            cropType: "processed",
            image: "cassava.jpg",
            inStock: true,
            createdAt: new Date(),
          },
        ];

        // Apply filters
        let filtered = mockProducts;

        // Filter by crop type
        if (input.cropType && input.cropType.length > 0) {
          filtered = filtered.filter((p) => input.cropType?.includes(p.cropType));
        }

        // Filter by price range
        if (input.priceRange) {
          if (input.priceRange.min !== undefined) {
            filtered = filtered.filter((p) => p.price >= input.priceRange!.min!);
          }
          if (input.priceRange.max !== undefined) {
            filtered = filtered.filter((p) => p.price <= input.priceRange!.max!);
          }
        }

        // Filter by rating
        if (input.rating !== undefined) {
          filtered = filtered.filter((p) => p.rating >= input.rating!);
        }

        // Filter by location
        if (input.location) {
          filtered = filtered.filter((p) =>
            p.location.toLowerCase().includes(input.location!.toLowerCase())
          );
        }

        // Sort results
        if (input.sortBy) {
          switch (input.sortBy) {
            case "price_asc":
              filtered.sort((a, b) => a.price - b.price);
              break;
            case "price_desc":
              filtered.sort((a, b) => b.price - a.price);
              break;
            case "rating":
              filtered.sort((a, b) => b.rating - a.rating);
              break;
            case "newest":
              filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
              break;
            case "relevance":
            default:
              // Keep original order
              break;
          }
        }

        // Paginate
        const total = filtered.length;
        const results = filtered.slice(input.offset, input.offset + input.limit);

        return {
          results,
          total,
          hasMore: input.offset + input.limit < total,
          filters: {
            appliedFilters: {
              cropType: input.cropType,
              priceRange: input.priceRange,
              rating: input.rating,
              location: input.location,
            },
            availableCropTypes: ["vegetables", "grains", "fruits", "processed", "livestock"],
            priceRange: { min: 1000, max: 50000 },
            locations: ["Ashanti Region", "Northern Region", "Western Region", "Eastern Region"],
          },
        };
      } catch (error) {
        console.error("Marketplace search error:", error);
        throw error;
      }
    }),

  // Search community forum posts
  searchForumPosts: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        dateRange: z
          .object({
            from: z.date().optional(),
            to: z.date().optional(),
          })
          .optional(),
        sortBy: z.enum(["relevance", "newest", "most_viewed", "most_liked", "trending"]).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        // Mock forum posts - in real app, use full-text search
        const mockPosts = [
          {
            id: 1,
            title: "Best practices for cassava farming",
            content: "Share your experiences with cassava cultivation...",
            category: "Crop Cultivation",
            tags: ["cassava", "farming", "best-practices"],
            author: "John Farmer",
            authorRating: 4.8,
            views: 1250,
            likes: 342,
            replies: 28,
            createdAt: new Date(Date.now() - 86400000),
            trending: true,
          },
          {
            id: 2,
            title: "Dealing with crop diseases",
            content: "How do you handle common crop diseases?",
            category: "Pest & Disease Management",
            tags: ["disease", "pest", "management"],
            author: "Jane Expert",
            authorRating: 4.9,
            views: 856,
            likes: 215,
            replies: 15,
            createdAt: new Date(Date.now() - 172800000),
            trending: false,
          },
          {
            id: 3,
            title: "Livestock breeding guide",
            content: "Complete guide to successful animal breeding...",
            category: "Livestock Management",
            tags: ["breeding", "livestock", "guide"],
            author: "Mark Breeder",
            authorRating: 4.7,
            views: 2100,
            likes: 567,
            replies: 42,
            createdAt: new Date(Date.now() - 259200000),
            trending: true,
          },
        ];

        // Apply filters
        let filtered = mockPosts;

        // Filter by category
        if (input.category && input.category.length > 0) {
          filtered = filtered.filter((p) => input.category?.includes(p.category));
        }

        // Filter by tags
        if (input.tags && input.tags.length > 0) {
          filtered = filtered.filter((p) =>
            input.tags!.some((tag) => p.tags.includes(tag))
          );
        }

        // Filter by date range
        if (input.dateRange) {
          if (input.dateRange.from) {
            filtered = filtered.filter((p) => p.createdAt >= input.dateRange!.from!);
          }
          if (input.dateRange.to) {
            filtered = filtered.filter((p) => p.createdAt <= input.dateRange!.to!);
          }
        }

        // Sort results
        if (input.sortBy) {
          switch (input.sortBy) {
            case "newest":
              filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
              break;
            case "most_viewed":
              filtered.sort((a, b) => b.views - a.views);
              break;
            case "most_liked":
              filtered.sort((a, b) => b.likes - a.likes);
              break;
            case "trending":
              filtered.sort((a, b) => {
                if (a.trending === b.trending) return 0;
                return a.trending ? -1 : 1;
              });
              break;
            case "relevance":
            default:
              break;
          }
        }

        // Paginate
        const total = filtered.length;
        const results = filtered.slice(input.offset, input.offset + input.limit);

        return {
          results,
          total,
          hasMore: input.offset + input.limit < total,
          filters: {
            appliedFilters: {
              category: input.category,
              tags: input.tags,
              dateRange: input.dateRange,
            },
            availableCategories: [
              "Crop Cultivation",
              "Livestock Management",
              "Pest & Disease Management",
              "Market & Pricing",
              "Technology & Innovation",
              "General Discussion",
            ],
            popularTags: [
              "cassava",
              "maize",
              "rice",
              "livestock",
              "breeding",
              "disease",
              "pest",
              "weather",
              "irrigation",
              "fertilizer",
            ],
          },
        };
      } catch (error) {
        console.error("Forum search error:", error);
        throw error;
      }
    }),

  // Get search suggestions
  getSearchSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["products", "forum", "all"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const suggestions = {
          products: [
            "Fresh Tomatoes",
            "Organic Rice",
            "Cassava Flour",
            "Fresh Maize",
            "Fertilizer",
          ],
          forum: [
            "Best practices for cassava farming",
            "Dealing with crop diseases",
            "Livestock breeding guide",
            "Irrigation techniques",
            "Pest management strategies",
          ],
        };

        const filtered = input.type === "all"
          ? [...suggestions.products, ...suggestions.forum]
          : suggestions[input.type || "all"];

        return {
          suggestions: filtered
            .filter((s) => s.toLowerCase().includes(input.query.toLowerCase()))
            .slice(0, 10),
        };
      } catch (error) {
        console.error("Search suggestions error:", error);
        throw error;
      }
    }),

  // Save search query
  saveSearchQuery: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["products", "forum"]),
        filters: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In real app, save to database
        console.log(`Saved search query for user ${ctx.user.id}:`, input.query);

        return {
          success: true,
          message: "Search query saved",
        };
      } catch (error) {
        console.error("Save search error:", error);
        throw error;
      }
    }),

  // Get saved searches
  getSavedSearches: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Mock saved searches - in real app, fetch from database
      return {
        searches: [
          {
            id: 1,
            query: "organic rice",
            type: "products",
            filters: { priceRange: { min: 7000, max: 10000 } },
            createdAt: new Date(),
          },
          {
            id: 2,
            query: "cassava farming",
            type: "forum",
            filters: { category: ["Crop Cultivation"] },
            createdAt: new Date(),
          },
        ],
      };
    } catch (error) {
      console.error("Get saved searches error:", error);
      throw error;
    }
  }),

  // Delete saved search
  deleteSavedSearch: protectedProcedure
    .input(z.object({ searchId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`Deleted saved search ${input.searchId} for user ${ctx.user.id}`);

        return {
          success: true,
          message: "Saved search deleted",
        };
      } catch (error) {
        console.error("Delete saved search error:", error);
        throw error;
      }
    }),

  // Get trending searches
  getTrendingSearches: publicProcedure.query(async () => {
    try {
      return {
        trending: [
          { query: "cassava", count: 1250, trend: "up" },
          { query: "rice farming", count: 980, trend: "up" },
          { query: "livestock breeding", count: 756, trend: "stable" },
          { query: "pest management", count: 645, trend: "down" },
          { query: "irrigation", count: 534, trend: "up" },
        ],
      };
    } catch (error) {
      console.error("Get trending searches error:", error);
      throw error;
    }
  }),
});
