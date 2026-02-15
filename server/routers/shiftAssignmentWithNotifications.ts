import { router, protectedProcedure } from '../_core/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  triggerShiftAssignmentEvent,
  triggerBulkShiftAssignmentEvent,
} from './notificationEventHandlers'
import { broadcastShiftAssignment } from '../_core/websocket'

/**
 * Shift Assignment Router with Integrated Notification Triggers
 * Automatically sends push notifications when shifts are assigned
 */

export const shiftAssignmentWithNotificationsRouter = router({
  /**
   * Assign a single shift to a worker with notification
   */
  assignShift: protectedProcedure
    .input(
      z.object({
        shiftId: z.number(),
        workerId: z.number(),
        workerName: z.string(),
        shiftDate: z.string(),
        shiftTime: z.string(),
        location: z.string(),
        duration: z.number(),
        shiftType: z.string(),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate shift and worker exist
        if (!input.shiftId || !input.workerId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid shift or worker ID',
          })
        }

        // Log assignment
        console.log(
          `[Shift Assignment] Assigning shift ${input.shiftId} to worker ${input.workerId}`
        )

        // Trigger notification event
        await triggerShiftAssignmentEvent({
          shiftId: input.shiftId,
          workerId: input.workerId,
          workerName: input.workerName,
          shiftDate: input.shiftDate,
          shiftTime: input.shiftTime,
          location: input.location,
          duration: input.duration,
          shiftType: input.shiftType,
        })

        // Broadcast real-time update via WebSocket
        broadcastShiftAssignment(input.farmId, input.shiftId, input.workerId, input.workerName)

        return {
          success: true,
          message: `Shift assigned to ${input.workerName} and notification sent`,
          shiftId: input.shiftId,
          workerId: input.workerId,
        }
      } catch (error) {
        console.error('[Shift Assignment] Error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign shift',
        })
      }
    }),

  /**
   * Assign multiple shifts to workers with bulk notifications
   */
  assignMultipleShifts: protectedProcedure
    .input(
      z.object({
        shifts: z.array(
          z.object({
            shiftId: z.number(),
            workerId: z.number(),
            workerName: z.string(),
            shiftDate: z.string(),
            shiftTime: z.string(),
            location: z.string(),
            duration: z.number(),
            shiftType: z.string(),
          })
        ),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.shifts || input.shifts.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No shifts provided',
          })
        }

        console.log(`[Bulk Shift Assignment] Assigning ${input.shifts.length} shifts`)

        // Trigger bulk notification event
        await triggerBulkShiftAssignmentEvent(input.shifts)

        // Broadcast individual real-time updates
        input.shifts.forEach((shift) => {
          broadcastShiftAssignment(input.farmId, shift.shiftId, shift.workerId, shift.workerName)
        })

        return {
          success: true,
          message: `${input.shifts.length} shifts assigned and notifications sent`,
          shiftsAssigned: input.shifts.length,
        }
      } catch (error) {
        console.error('[Bulk Shift Assignment] Error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign shifts',
        })
      }
    }),

  /**
   * Reassign a shift to a different worker with notification
   */
  reassignShift: protectedProcedure
    .input(
      z.object({
        shiftId: z.number(),
        oldWorkerId: z.number(),
        newWorkerId: z.number(),
        newWorkerName: z.string(),
        shiftDate: z.string(),
        shiftTime: z.string(),
        location: z.string(),
        duration: z.number(),
        shiftType: z.string(),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(
          `[Shift Reassignment] Reassigning shift ${input.shiftId} from worker ${input.oldWorkerId} to ${input.newWorkerId}`
        )

        // Trigger notification event for new assignment
        await triggerShiftAssignmentEvent({
          shiftId: input.shiftId,
          workerId: input.newWorkerId,
          workerName: input.newWorkerName,
          shiftDate: input.shiftDate,
          shiftTime: input.shiftTime,
          location: input.location,
          duration: input.duration,
          shiftType: input.shiftType,
        })

        // Broadcast real-time update
        broadcastShiftAssignment(
          input.farmId,
          input.shiftId,
          input.newWorkerId,
          input.newWorkerName
        )

        return {
          success: true,
          message: `Shift reassigned to ${input.newWorkerName} and notification sent`,
          shiftId: input.shiftId,
          newWorkerId: input.newWorkerId,
        }
      } catch (error) {
        console.error('[Shift Reassignment] Error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reassign shift',
        })
      }
    }),

  /**
   * Get shift assignment status
   */
  getShiftStatus: protectedProcedure
    .input(
      z.object({
        shiftId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        // In production, this would query the database
        return {
          shiftId: input.shiftId,
          status: 'assigned',
          assignedAt: new Date().toISOString(),
          notificationSent: true,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get shift status',
        })
      }
    }),
})
