import { z } from 'zod'
import { protectedProcedure, router } from '../_core/trpc'
import { TRPCError } from '@trpc/server'

/**
 * Notification Preferences Router
 * Manages user notification settings and preferences
 */

const NotificationTypeSchema = z.enum(['shifts', 'tasks', 'approvals', 'alerts', 'compliance', 'all'])
const DeliveryMethodSchema = z.enum(['push', 'sms', 'email', 'in_app'])

const NotificationPreferencesSchema = z.object({
  userId: z.number(),
  shiftNotifications: z.boolean().default(true),
  taskNotifications: z.boolean().default(true),
  approvalNotifications: z.boolean().default(true),
  alertNotifications: z.boolean().default(true),
  complianceNotifications: z.boolean().default(true),
  deliveryMethods: z.array(DeliveryMethodSchema).default(['push', 'in_app']),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }).optional(),
  notificationFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
  unsubscribedTypes: z.array(NotificationTypeSchema).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>

// Mock database for preferences
const preferencesStore = new Map<number, NotificationPreferences>()

export const notificationPreferencesRouter = router({
  /**
   * Get notification preferences for current user
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id

      // Check if preferences exist
      let preferences = preferencesStore.get(userId)

      if (!preferences) {
        // Create default preferences
        preferences = {
          userId,
          shiftNotifications: true,
          taskNotifications: true,
          approvalNotifications: true,
          alertNotifications: true,
          complianceNotifications: true,
          deliveryMethods: ['push', 'in_app'],
          notificationFrequency: 'immediate',
          unsubscribedTypes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        preferencesStore.set(userId, preferences)
      }

      return preferences
    } catch (error) {
      console.error('[NotificationPreferences] Error getting preferences:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get notification preferences',
      })
    }
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        shiftNotifications: z.boolean().optional(),
        taskNotifications: z.boolean().optional(),
        approvalNotifications: z.boolean().optional(),
        alertNotifications: z.boolean().optional(),
        complianceNotifications: z.boolean().optional(),
        deliveryMethods: z.array(DeliveryMethodSchema).optional(),
        notificationFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional(),
        quietHours: z.object({
          enabled: z.boolean(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get existing preferences or create default
        let preferences = preferencesStore.get(userId) || {
          userId,
          shiftNotifications: true,
          taskNotifications: true,
          approvalNotifications: true,
          alertNotifications: true,
          complianceNotifications: true,
          deliveryMethods: ['push', 'in_app'],
          notificationFrequency: 'immediate',
          unsubscribedTypes: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Update preferences
        preferences = {
          ...preferences,
          ...input,
          updatedAt: new Date(),
        }

        preferencesStore.set(userId, preferences)

        console.log('[NotificationPreferences] Updated preferences for user:', userId)
        return preferences
      } catch (error) {
        console.error('[NotificationPreferences] Error updating preferences:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification preferences',
        })
      }
    }),

  /**
   * Toggle specific notification type
   */
  toggleNotificationType: protectedProcedure
    .input(
      z.object({
        type: z.enum(['shifts', 'tasks', 'approvals', 'alerts', 'compliance']),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        let preferences = preferencesStore.get(userId)

        if (!preferences) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification preferences not found',
          })
        }

        // Toggle notification type
        const typeKey = `${input.type}Notifications` as keyof NotificationPreferences
        if (typeKey in preferences && typeof preferences[typeKey] === 'boolean') {
          ;(preferences as any)[typeKey] = input.enabled
        }

        preferences.updatedAt = new Date()
        preferencesStore.set(userId, preferences)

        console.log(`[NotificationPreferences] Toggled ${input.type} notifications to ${input.enabled}`)
        return preferences
      } catch (error) {
        console.error('[NotificationPreferences] Error toggling notification type:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle notification type',
        })
      }
    }),

  /**
   * Update delivery methods
   */
  updateDeliveryMethods: protectedProcedure
    .input(
      z.object({
        methods: z.array(DeliveryMethodSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        let preferences = preferencesStore.get(userId)

        if (!preferences) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification preferences not found',
          })
        }

        preferences.deliveryMethods = input.methods
        preferences.updatedAt = new Date()
        preferencesStore.set(userId, preferences)

        console.log('[NotificationPreferences] Updated delivery methods:', input.methods)
        return preferences
      } catch (error) {
        console.error('[NotificationPreferences] Error updating delivery methods:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update delivery methods',
        })
      }
    }),

  /**
   * Set quiet hours
   */
  setQuietHours: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        let preferences = preferencesStore.get(userId)

        if (!preferences) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification preferences not found',
          })
        }

        if (input.enabled && (!input.startTime || !input.endTime)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Start time and end time are required when quiet hours are enabled',
          })
        }

        preferences.quietHours = {
          enabled: input.enabled,
          startTime: input.startTime,
          endTime: input.endTime,
        }
        preferences.updatedAt = new Date()
        preferencesStore.set(userId, preferences)

        console.log('[NotificationPreferences] Updated quiet hours:', input)
        return preferences
      } catch (error) {
        console.error('[NotificationPreferences] Error setting quiet hours:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set quiet hours',
        })
      }
    }),

  /**
   * Set notification frequency
   */
  setNotificationFrequency: protectedProcedure
    .input(
      z.object({
        frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id
        let preferences = preferencesStore.get(userId)

        if (!preferences) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Notification preferences not found',
          })
        }

        preferences.notificationFrequency = input.frequency
        preferences.updatedAt = new Date()
        preferencesStore.set(userId, preferences)

        console.log('[NotificationPreferences] Updated notification frequency:', input.frequency)
        return preferences
      } catch (error) {
        console.error('[NotificationPreferences] Error setting notification frequency:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set notification frequency',
        })
      }
    }),

  /**
   * Unsubscribe from all notifications
   */
  unsubscribeAll: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user.id
      let preferences = preferencesStore.get(userId)

      if (!preferences) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification preferences not found',
        })
      }

      preferences.shiftNotifications = false
      preferences.taskNotifications = false
      preferences.approvalNotifications = false
      preferences.alertNotifications = false
      preferences.complianceNotifications = false
      preferences.unsubscribedTypes = ['all']
      preferences.updatedAt = new Date()
      preferencesStore.set(userId, preferences)

      console.log('[NotificationPreferences] User unsubscribed from all notifications')
      return preferences
    } catch (error) {
      console.error('[NotificationPreferences] Error unsubscribing from all:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to unsubscribe from all notifications',
      })
    }
  }),

  /**
   * Resubscribe to all notifications
   */
  resubscribeAll: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user.id
      let preferences = preferencesStore.get(userId)

      if (!preferences) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification preferences not found',
        })
      }

      preferences.shiftNotifications = true
      preferences.taskNotifications = true
      preferences.approvalNotifications = true
      preferences.alertNotifications = true
      preferences.complianceNotifications = true
      preferences.unsubscribedTypes = []
      preferences.updatedAt = new Date()
      preferencesStore.set(userId, preferences)

      console.log('[NotificationPreferences] User resubscribed to all notifications')
      return preferences
    } catch (error) {
      console.error('[NotificationPreferences] Error resubscribing to all:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to resubscribe to all notifications',
      })
    }
  }),

  /**
   * Reset to default preferences
   */
  resetToDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user.id

      const defaultPreferences: NotificationPreferences = {
        userId,
        shiftNotifications: true,
        taskNotifications: true,
        approvalNotifications: true,
        alertNotifications: true,
        complianceNotifications: true,
        deliveryMethods: ['push', 'in_app'],
        notificationFrequency: 'immediate',
        unsubscribedTypes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      preferencesStore.set(userId, defaultPreferences)

      console.log('[NotificationPreferences] Reset preferences to defaults for user:', userId)
      return defaultPreferences
    } catch (error) {
      console.error('[NotificationPreferences] Error resetting to defaults:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset notification preferences',
      })
    }
  }),
})
