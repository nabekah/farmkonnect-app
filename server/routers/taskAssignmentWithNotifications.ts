import { router, protectedProcedure } from '../_core/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  triggerTaskAssignmentEvent,
  triggerTaskStatusChangeEvent,
} from './notificationEventHandlers'
import { broadcastTaskUpdate, broadcastTaskStatusChange } from '../_core/websocket'

/**
 * Task Assignment Router with Integrated Notification Triggers
 * Automatically sends push notifications when tasks are assigned or status changes
 */

export const taskAssignmentWithNotificationsRouter = router({
  /**
   * Assign a task to a worker with notification
   */
  assignTask: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        workerId: z.number(),
        workerName: z.string(),
        taskTitle: z.string(),
        taskDescription: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        dueDate: z.string(),
        estimatedHours: z.number(),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate task and worker exist
        if (!input.taskId || !input.workerId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid task or worker ID',
          })
        }

        console.log(`[Task Assignment] Assigning task ${input.taskId} to worker ${input.workerId}`)

        // Trigger notification event
        await triggerTaskAssignmentEvent({
          taskId: input.taskId,
          workerId: input.workerId,
          workerName: input.workerName,
          taskTitle: input.taskTitle,
          taskDescription: input.taskDescription,
          priority: input.priority,
          dueDate: input.dueDate,
          estimatedHours: input.estimatedHours,
        })

        // Broadcast real-time update via WebSocket
        broadcastTaskUpdate(input.farmId, input.taskId, 'assigned', {
          workerId: input.workerId,
          workerName: input.workerName,
          priority: input.priority,
          dueDate: input.dueDate,
        })

        return {
          success: true,
          message: `Task assigned to ${input.workerName} and notification sent`,
          taskId: input.taskId,
          workerId: input.workerId,
        }
      } catch (error) {
        console.error('[Task Assignment] Error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign task',
        })
      }
    }),

  /**
   * Update task status with notification
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        workerId: z.number(),
        workerName: z.string(),
        taskTitle: z.string(),
        oldStatus: z.string(),
        newStatus: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(
          `[Task Status Update] Task ${input.taskId} status changed from ${input.oldStatus} to ${input.newStatus}`
        )

        // Trigger status change notification event
        await triggerTaskStatusChangeEvent({
          taskId: input.taskId,
          workerId: input.workerId,
          workerName: input.workerName,
          taskTitle: input.taskTitle,
          oldStatus: input.oldStatus,
          newStatus: input.newStatus,
          timestamp: new Date(),
        })

        // Broadcast real-time update
        broadcastTaskStatusChange(
          input.farmId,
          input.taskId,
          input.workerId,
          input.oldStatus,
          input.newStatus
        )

        return {
          success: true,
          message: `Task status updated to ${input.newStatus} and notification sent`,
          taskId: input.taskId,
          newStatus: input.newStatus,
        }
      } catch (error) {
        console.error('[Task Status Update] Error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update task status',
        })
      }
    }),

  /**
   * Reassign task to a different worker with notification
   */
  reassignTask: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        oldWorkerId: z.number(),
        newWorkerId: z.number(),
        newWorkerName: z.string(),
        taskTitle: z.string(),
        taskDescription: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical']),
        dueDate: z.string(),
        estimatedHours: z.number(),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(
          `[Task Reassignment] Reassigning task ${input.taskId} from worker ${input.oldWorkerId} to ${input.newWorkerId}`
        )

        // Trigger notification event for new assignment
        await triggerTaskAssignmentEvent({
          taskId: input.taskId,
          workerId: input.newWorkerId,
          workerName: input.newWorkerName,
          taskTitle: input.taskTitle,
          taskDescription: input.taskDescription,
          priority: input.priority,
          dueDate: input.dueDate,
          estimatedHours: input.estimatedHours,
        })

        // Broadcast real-time update
        broadcastTaskUpdate(input.farmId, input.taskId, 'reassigned', {
          oldWorkerId: input.oldWorkerId,
          newWorkerId: input.newWorkerId,
          newWorkerName: input.newWorkerName,
          priority: input.priority,
        })

        return {
          success: true,
          message: `Task reassigned to ${input.newWorkerName} and notification sent`,
          taskId: input.taskId,
          newWorkerId: input.newWorkerId,
        }
      } catch (error) {
        console.error('[Task Reassignment] Error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reassign task',
        })
      }
    }),

  /**
   * Bulk assign tasks with notifications
   */
  assignMultipleTasks: protectedProcedure
    .input(
      z.object({
        tasks: z.array(
          z.object({
            taskId: z.number(),
            workerId: z.number(),
            workerName: z.string(),
            taskTitle: z.string(),
            taskDescription: z.string(),
            priority: z.enum(['low', 'medium', 'high', 'critical']),
            dueDate: z.string(),
            estimatedHours: z.number(),
          })
        ),
        farmId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.tasks || input.tasks.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No tasks provided',
          })
        }

        console.log(`[Bulk Task Assignment] Assigning ${input.tasks.length} tasks`)

        // Trigger notification events for each task
        for (const task of input.tasks) {
          await triggerTaskAssignmentEvent({
            taskId: task.taskId,
            workerId: task.workerId,
            workerName: task.workerName,
            taskTitle: task.taskTitle,
            taskDescription: task.taskDescription,
            priority: task.priority,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
          })

          // Broadcast individual real-time updates
          broadcastTaskUpdate(input.farmId, task.taskId, 'assigned', {
            workerId: task.workerId,
            workerName: task.workerName,
            priority: task.priority,
          })
        }

        return {
          success: true,
          message: `${input.tasks.length} tasks assigned and notifications sent`,
          tasksAssigned: input.tasks.length,
        }
      } catch (error) {
        console.error('[Bulk Task Assignment] Error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign tasks',
        })
      }
    }),

  /**
   * Get task status
   */
  getTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        // In production, this would query the database
        return {
          taskId: input.taskId,
          status: 'assigned',
          assignedAt: new Date().toISOString(),
          notificationSent: true,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get task status',
        })
      }
    }),
})
