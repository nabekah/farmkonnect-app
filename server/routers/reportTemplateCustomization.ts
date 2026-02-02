import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { reportTemplateCustomizationService } from "../_core/reportTemplateCustomizationService";

export const reportTemplateCustomizationRouter = router({
  /**
   * Get all sections for a template
   */
  getTemplateSections: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      return await reportTemplateCustomizationService.getTemplateSections(
        input.templateId
      );
    }),

  /**
   * Update section visibility
   */
  updateSectionVisibility: protectedProcedure
    .input(
      z.object({
        sectionId: z.number(),
        isEnabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await reportTemplateCustomizationService.updateSectionVisibility(
        input.sectionId,
        input.isEnabled
      );
      return { success: true };
    }),

  /**
   * Reorder sections
   */
  reorderSections: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        sections: z.array(
          z.object({
            id: z.number(),
            displayOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      await reportTemplateCustomizationService.reorderSections(
        input.templateId,
        input.sections
      );
      return { success: true };
    }),

  /**
   * Add custom section
   */
  addCustomSection: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        sectionName: z.string(),
        customContent: z.string(),
        displayOrder: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await reportTemplateCustomizationService.addCustomSection(
        input.templateId,
        input.sectionName,
        input.customContent,
        input.displayOrder
      );
      return { success: true };
    }),

  /**
   * Delete custom section
   */
  deleteCustomSection: protectedProcedure
    .input(z.object({ sectionId: z.number() }))
    .mutation(async ({ input }) => {
      await reportTemplateCustomizationService.deleteCustomSection(
        input.sectionId
      );
      return { success: true };
    }),

  /**
   * Get template customization for a farm
   */
  getCustomization: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        farmId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await reportTemplateCustomizationService.getCustomization(
        input.templateId,
        input.farmId
      );
    }),

  /**
   * Update template customization
   */
  updateCustomization: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        farmId: z.number(),
        brandingColor: z.string().optional(),
        headerText: z.string().optional(),
        footerText: z.string().optional(),
        logoUrl: z.string().optional(),
        includeCharts: z.boolean().optional(),
        includeMetrics: z.boolean().optional(),
        includeRecommendations: z.boolean().optional(),
        pageOrientation: z.enum(["portrait", "landscape"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { templateId, farmId, ...customization } = input;
      await reportTemplateCustomizationService.updateCustomization(
        templateId,
        farmId,
        customization
      );
      return { success: true };
    }),

  /**
   * Get enabled sections for report generation
   */
  getEnabledSections: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      return await reportTemplateCustomizationService.getEnabledSections(
        input.templateId
      );
    }),

  /**
   * Clone customization from one farm to another
   */
  cloneCustomization: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        fromFarmId: z.number(),
        toFarmId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await reportTemplateCustomizationService.cloneCustomization(
        input.templateId,
        input.fromFarmId,
        input.toFarmId
      );
      return { success: true };
    }),

  /**
   * Get customization statistics
   */
  getCustomizationStats: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      return await reportTemplateCustomizationService.getCustomizationStats(
        input.templateId
      );
    }),
});
