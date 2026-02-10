import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const chatbotRouter = router({
  // Send message to chatbot
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        message: z.string(),
        context: z.object({
          farmId: z.number().optional(),
          cropType: z.string().optional(),
          location: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const conversationId = input.conversationId || `conv_${Date.now()}`;
      
      try {
        // Build system prompt based on context
        let systemPrompt = `You are FarmKonnect AI Assistant, an expert agricultural advisor helping Nigerian farmers. 
You provide practical farming advice, crop recommendations, pest management, soil health, and market information.
Be concise, friendly, and provide actionable advice. Include local context when relevant.`;

        if (input.context?.cropType) {
          systemPrompt += `\nThe farmer is growing ${input.context.cropType}.`;
        }
        if (input.context?.location) {
          systemPrompt += `\nThe farm is located in ${input.context.location}.`;
        }

        // Call LLM
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.message },
          ],
        });

        const assistantMessage = response.choices[0].message.content;

        return {
          success: true,
          conversationId,
          userMessage: input.message,
          assistantMessage,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to get response from AI assistant",
          conversationId,
        };
      }
    }),

  // Get conversation history
  getConversationHistory: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      // In production, this would fetch from database
      return {
        conversationId: input.conversationId,
        messages: [
          {
            id: 1,
            role: "user",
            content: "What's the best time to plant tomatoes in Lagos?",
            timestamp: Date.now() - 3600000,
          },
          {
            id: 2,
            role: "assistant",
            content: "In Lagos, tomatoes are best planted during the dry season (November to March). The optimal temperature range is 20-30°C. Here are key steps:\n\n1. **Soil Preparation**: Use well-drained soil with organic matter\n2. **Seedling**: Start seeds 6-8 weeks before transplanting\n3. **Spacing**: Plant 45cm apart in rows 60cm apart\n4. **Watering**: Keep soil consistently moist but not waterlogged\n5. **Support**: Use stakes or cages for support\n\nExpect harvest in 60-80 days.",
            timestamp: Date.now() - 3300000,
          },
          {
            id: 3,
            role: "user",
            content: "How do I prevent early blight?",
            timestamp: Date.now() - 1800000,
          },
          {
            id: 4,
            role: "assistant",
            content: "Early blight is a common tomato disease. Here's how to prevent it:\n\n**Prevention Methods:**\n1. **Spacing**: Ensure good air circulation between plants\n2. **Watering**: Water at soil level, avoid wetting leaves\n3. **Mulching**: Apply 5-7cm mulch to prevent soil splash\n4. **Pruning**: Remove lower leaves as plant grows\n5. **Rotation**: Don't plant tomatoes in same location for 3 years\n\n**If infection occurs:**\n- Remove affected leaves immediately\n- Apply fungicide (copper-based)\n- Increase spacing and reduce watering\n\nMonitor plants daily during rainy season.",
            timestamp: Date.now() - 1500000,
          },
        ],
      };
    }),

  // Get chatbot suggestions based on farm data
  getSuggestions: protectedProcedure
    .input(
      z.object({
        farmId: z.number(),
        type: z.enum(["planting", "pest_management", "market", "weather", "general"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return {
        suggestions: [
          {
            id: 1,
            type: "planting",
            title: "Optimal Planting Time for Pepper",
            description: "Based on your location and current weather, now is a good time to plant pepper. Temperature is ideal (25-28°C).",
            priority: "high",
            action: "Learn more",
          },
          {
            id: 2,
            type: "pest_management",
            title: "Armyworm Alert",
            description: "Armyworms detected in your region. Apply neem oil spray in early morning or late evening.",
            priority: "high",
            action: "Get treatment plan",
          },
          {
            id: 3,
            type: "market",
            title: "High Demand for Tomatoes",
            description: "Tomato prices are up 15% this week. Consider harvesting early if ready.",
            priority: "medium",
            action: "Check prices",
          },
          {
            id: 4,
            type: "weather",
            title: "Rain Expected Tomorrow",
            description: "Heavy rain expected. Ensure drainage is clear and cover any sensitive crops.",
            priority: "medium",
            action: "Prepare farm",
          },
        ],
      };
    }),

  // Ask specific farming question
  askQuestion: protectedProcedure
    .input(
      z.object({
        question: z.string(),
        category: z.enum(["crop_care", "pest_disease", "soil_health", "irrigation", "market", "equipment", "general"]),
        cropType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const systemPrompt = `You are an expert agricultural advisor for Nigerian farmers. 
Answer questions about ${input.category} with practical, actionable advice.
${input.cropType ? `Focus on ${input.cropType} cultivation.` : ""}
Keep answers concise but comprehensive. Include local context and best practices.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.question },
          ],
        });

        const answer = response.choices[0].message.content;

        return {
          success: true,
          question: input.question,
          answer,
          category: input.category,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to get answer",
        };
      }
    }),

  // Get farming tips
  getFarmingTips: protectedProcedure
    .input(
      z.object({
        category: z.enum(["soil", "water", "pest", "crop", "market", "equipment"]),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      const tips: Record<string, string[]> = {
        soil: [
          "Test soil pH annually. Most crops prefer 6.0-7.0 pH",
          "Add organic matter (compost) to improve soil structure",
          "Rotate crops to prevent nutrient depletion",
          "Use mulch to retain moisture and suppress weeds",
          "Avoid tilling when soil is wet to prevent compaction",
        ],
        water: [
          "Water early morning or late evening to reduce evaporation",
          "Most crops need 25-50mm water per week",
          "Drip irrigation is 30-50% more efficient than flooding",
          "Check soil moisture 10cm deep before watering",
          "Mulch reduces water needs by 25-50%",
        ],
        pest: [
          "Scout fields weekly for pest signs",
          "Use neem oil for organic pest control",
          "Companion planting can deter pests naturally",
          "Remove affected plants immediately to prevent spread",
          "Encourage natural predators like ladybugs",
        ],
        crop: [
          "Start seeds indoors 6-8 weeks before transplanting",
          "Harden seedlings by exposing to outdoor conditions gradually",
          "Space plants according to mature size for air circulation",
          "Prune regularly to improve yield and quality",
          "Harvest at peak ripeness for best flavor and nutrition",
        ],
        market: [
          "Check market prices before harvesting",
          "Group with other farmers for bulk sales",
          "Develop relationships with regular buyers",
          "Consider value-added products for higher margins",
          "Use FarmKonnect marketplace to reach more buyers",
        ],
        equipment: [
          "Maintain equipment regularly to extend lifespan",
          "Sharpen tools before each season",
          "Store equipment in dry place to prevent rust",
          "Clean equipment after use to prevent disease spread",
          "Rent equipment from FarmKonnect to reduce costs",
        ],
      };

      return {
        category: input.category,
        tips: tips[input.category]?.slice(0, input.limit) || [],
      };
    }),

  // Get crop recommendations
  getCropRecommendations: protectedProcedure
    .input(
      z.object({
        soilType: z.string().optional(),
        rainfall: z.number().optional(),
        temperature: z.number().optional(),
        budget: z.number().optional(),
        season: z.enum(["dry", "wet"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return {
        recommendations: [
          {
            crop: "Tomato",
            suitability: 9.2,
            reason: "Excellent for your soil type and climate",
            profitability: "High",
            timeToHarvest: "60-80 days",
            marketDemand: "Very High",
          },
          {
            crop: "Pepper",
            suitability: 8.8,
            reason: "Well-suited to your region",
            profitability: "High",
            timeToHarvest: "90-120 days",
            marketDemand: "High",
          },
          {
            crop: "Lettuce",
            suitability: 7.5,
            reason: "Good for quick returns",
            profitability: "Medium",
            timeToHarvest: "30-45 days",
            marketDemand: "Medium",
          },
          {
            crop: "Cucumber",
            suitability: 8.1,
            reason: "Suitable for your climate",
            profitability: "Medium-High",
            timeToHarvest: "50-70 days",
            marketDemand: "High",
          },
        ],
      };
    }),

  // Report issue and get help
  reportIssue: protectedProcedure
    .input(
      z.object({
        issueType: z.enum(["pest", "disease", "weather_damage", "equipment", "other"]),
        description: z.string(),
        photos: z.array(z.string()).optional(),
        cropType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const systemPrompt = `You are an agricultural expert diagnosing farm issues.
Based on the description, identify the problem and provide treatment recommendations.
Be practical and reference local solutions.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `Issue Type: ${input.issueType}\nCrop: ${input.cropType || "Unknown"}\nDescription: ${input.description}` 
            },
          ],
        });

        const diagnosis = response.choices[0].message.content;

        return {
          success: true,
          issueId: `issue_${Date.now()}`,
          diagnosis,
          recommendations: [
            "Monitor the affected area daily",
            "Document changes with photos",
            "Contact local agricultural extension if condition worsens",
            "Consider consulting with a specialist",
          ],
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to analyze issue",
        };
      }
    }),

  // Get frequently asked questions
  getFAQ: protectedProcedure.query(async () => {
    return {
      faqs: [
        {
          id: 1,
          question: "What's the best fertilizer for tomatoes?",
          answer: "Use balanced NPK (10-10-10) at planting, then switch to high potassium (10-10-20) during fruiting. Apply every 2-3 weeks.",
          category: "crop_care",
          helpful: 234,
        },
        {
          id: 2,
          question: "How do I know when to harvest?",
          answer: "Most vegetables are ready when they reach full color and size. Harvest in early morning for best quality.",
          category: "crop_care",
          helpful: 189,
        },
        {
          id: 3,
          question: "What's the minimum farm size to be profitable?",
          answer: "Even 0.5 hectares can be profitable with intensive cultivation and direct sales. Focus on high-value crops.",
          category: "general",
          helpful: 156,
        },
        {
          id: 4,
          question: "How do I prevent crop failure?",
          answer: "Use certified seeds, maintain soil health, practice crop rotation, monitor for pests regularly, and have irrigation backup.",
          category: "crop_care",
          helpful: 201,
        },
      ],
    };
  }),

  // Create chatbot session
  createSession: protectedProcedure
    .input(
      z.object({
        farmId: z.number().optional(),
        topic: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sessionId = `session_${Date.now()}`;
      
      return {
        success: true,
        sessionId,
        createdAt: Date.now(),
        status: "active",
        initialMessage: "Hello! I'm your FarmKonnect AI Assistant. How can I help you with your farm today? You can ask about crop care, pest management, market prices, or any farming questions.",
      };
    }),

  // End chatbot session
  endSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        sessionId: input.sessionId,
        status: "closed",
        message: "Session ended. Thank you for using FarmKonnect AI Assistant!",
      };
    }),
});
