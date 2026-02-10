import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const mentorshipRouter = router({
  // Get available mentors
  getAvailableMentors: protectedProcedure
    .input(
      z.object({
        specialty: z.string().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      return {
        mentors: [
          {
            id: 1,
            name: "Dr. John Okonkwo",
            specialty: "Crop Production",
            rating: 4.9,
            reviews: 156,
            experience: 25,
            students: 45,
            hourlyRate: 5000,
            bio: "Expert in sustainable crop production with 25 years of experience",
            availability: "Mon-Fri 9am-5pm",
            certifications: ["Agricultural Science", "Soil Management", "Crop Diseases"],
          },
          {
            id: 2,
            name: "Mrs. Jane Adeyemi",
            specialty: "Livestock Management",
            rating: 4.8,
            reviews: 128,
            experience: 20,
            students: 38,
            hourlyRate: 4500,
            bio: "Specialized in dairy and poultry farming with proven track record",
            availability: "Tue-Sat 10am-6pm",
            certifications: ["Veterinary Science", "Animal Nutrition", "Breeding"],
          },
          {
            id: 3,
            name: "Mr. Ahmed Hassan",
            specialty: "Irrigation & Water Management",
            rating: 4.7,
            reviews: 98,
            experience: 18,
            students: 32,
            hourlyRate: 4000,
            bio: "Expert in water conservation and modern irrigation techniques",
            availability: "Mon-Thu 8am-4pm",
            certifications: ["Water Engineering", "Soil Science", "Climate Adaptation"],
          },
          {
            id: 4,
            name: "Dr. Sarah Okafor",
            specialty: "Organic Farming",
            rating: 4.9,
            reviews: 142,
            experience: 22,
            students: 50,
            hourlyRate: 5500,
            bio: "Pioneer in organic farming practices in West Africa",
            availability: "Mon-Fri 7am-3pm",
            certifications: ["Organic Certification", "Soil Biology", "Pest Management"],
          },
        ],
      };
    }),

  // Get mentor profile
  getMentorProfile: protectedProcedure
    .input(z.object({ mentorId: z.number() }))
    .query(async ({ input }) => {
      return {
        mentor: {
          id: input.mentorId,
          name: "Dr. John Okonkwo",
          specialty: "Crop Production",
          rating: 4.9,
          reviews: 156,
          experience: 25,
          students: 45,
          hourlyRate: 5000,
          bio: "Expert in sustainable crop production with 25 years of experience",
          availability: "Mon-Fri 9am-5pm",
          certifications: ["Agricultural Science", "Soil Management", "Crop Diseases"],
          successStories: [
            {
              studentName: "John Farmer",
              achievement: "Increased yield by 40%",
              duration: "3 months",
            },
            {
              studentName: "Jane Expert",
              achievement: "Switched to organic farming",
              duration: "6 months",
            },
          ],
          recentReviews: [
            {
              studentName: "Mark Breeder",
              rating: 5,
              comment: "Excellent mentor, very knowledgeable",
              date: Date.now() - 86400000,
            },
          ],
        },
      };
    }),

  // Request mentorship
  requestMentorship: protectedProcedure
    .input(
      z.object({
        mentorId: z.number(),
        topic: z.string(),
        duration: z.number(), // in weeks
        goals: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Mentorship request sent successfully",
        requestId: Math.floor(Math.random() * 1000),
        mentorId: input.mentorId,
        status: "pending",
      };
    }),

  // Get my mentorships
  getMyMentorships: protectedProcedure.query(async ({ ctx }) => {
    return {
      activeMentorships: 2,
      mentorships: [
        {
          id: 1,
          mentorId: 1,
          mentorName: "Dr. John Okonkwo",
          topic: "Sustainable Crop Production",
          startDate: Date.now() - 1209600000,
          endDate: Date.now() + 1209600000,
          progress: 60,
          sessions: 8,
          nextSession: Date.now() + 259200000,
          goals: ["Increase yield", "Reduce pesticide use", "Improve soil health"],
          status: "active",
        },
        {
          id: 2,
          mentorId: 2,
          mentorName: "Mrs. Jane Adeyemi",
          topic: "Dairy Farming Basics",
          startDate: Date.now() - 604800000,
          endDate: Date.now() + 1814400000,
          progress: 30,
          sessions: 4,
          nextSession: Date.now() + 172800000,
          goals: ["Start dairy farm", "Learn animal health", "Market dairy products"],
          status: "active",
        },
      ],
    };
  }),

  // Schedule session
  scheduleSession: protectedProcedure
    .input(
      z.object({
        mentorshipId: z.number(),
        date: z.number(),
        time: z.string(),
        topic: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Session scheduled successfully",
        sessionId: Math.floor(Math.random() * 1000),
        meetingLink: "https://meet.example.com/session-12345",
      };
    }),

  // Submit progress update
  submitProgressUpdate: protectedProcedure
    .input(
      z.object({
        mentorshipId: z.number(),
        update: z.string(),
        achievements: z.array(z.string()),
        challenges: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Progress update submitted successfully",
        updateId: Math.floor(Math.random() * 1000),
      };
    }),

  // Get certification status
  getCertificationStatus: protectedProcedure
    .input(z.object({ mentorshipId: z.number() }))
    .query(async ({ input }) => {
      return {
        mentorshipId: input.mentorshipId,
        progress: 75,
        completedModules: 9,
        totalModules: 12,
        modules: [
          { name: "Soil Preparation", completed: true },
          { name: "Seed Selection", completed: true },
          { name: "Planting Techniques", completed: true },
          { name: "Irrigation Management", completed: true },
          { name: "Pest Management", completed: true },
          { name: "Disease Control", completed: true },
          { name: "Fertilizer Application", completed: true },
          { name: "Harvesting", completed: true },
          { name: "Post-Harvest Handling", completed: true },
          { name: "Marketing & Sales", completed: false },
          { name: "Financial Management", completed: false },
          { name: "Sustainability Practices", completed: false },
        ],
        estimatedCompletion: Date.now() + 604800000,
        certificatePreview: "Certificate of Completion - Sustainable Crop Production",
      };
    }),

  // Get mentorship marketplace stats
  getMentorshipStats: protectedProcedure.query(async () => {
    return {
      totalMentors: 156,
      activeMentorships: 2340,
      completedCertifications: 1850,
      averageRating: 4.7,
      topSpecialties: [
        { specialty: "Crop Production", mentors: 45, students: 680 },
        { specialty: "Livestock Management", mentors: 38, students: 520 },
        { specialty: "Organic Farming", mentors: 32, students: 450 },
        { specialty: "Irrigation Management", mentors: 25, students: 340 },
        { specialty: "Business Management", mentors: 16, students: 250 },
      ],
    };
  }),

  // Rate mentor
  rateMentor: protectedProcedure
    .input(
      z.object({
        mentorshipId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Rating submitted successfully",
      };
    }),
});
