import { TRPCError } from '@trpc/server'
import { protectedProcedure, publicProcedure, router } from '../_core/trpc'
import { z } from 'zod'
import { notifyOwner } from '../_core/notification'

/**
 * Event Handlers for Shift and Task Notifications
 * Automatically triggers push notifications when shifts or tasks are created/updated
 */

// Types for notification events
interface ShiftAssignmentEvent {
  shiftId: number
  workerId: number
  workerName: string
  shiftDate: string
  shiftTime: string
  location: string
  duration: number
  shiftType: string
}

interface TaskAssignmentEvent {
  taskId: number
  workerId: number
  workerName: string
  taskTitle: string
  taskDescription: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  dueDate: string
  estimatedHours: number
}

interface TaskStatusChangeEvent {
  taskId: number
  workerId: number
  workerName: string
  taskTitle: string
  oldStatus: string
  newStatus: string
  timestamp: Date
}

interface TimeOffApprovalEvent {
  requestId: number
  workerId: number
  workerName: string
  startDate: string
  endDate: string
  status: 'approved' | 'rejected' | 'pending'
  reason?: string
}

// Store for notification subscriptions and event listeners
const notificationSubscriptions = new Map<number, string[]>()
const eventListeners = new Map<string, Function[]>()

/**
 * Register event listener for notification events
 */
function addEventListener(eventType: string, handler: Function) {
  if (!eventListeners.has(eventType)) {
    eventListeners.set(eventType, [])
  }
  eventListeners.get(eventType)?.push(handler)
}

/**
 * Emit notification event to all registered listeners
 */
function emitEvent(eventType: string, eventData: any) {
  const listeners = eventListeners.get(eventType) || []
  listeners.forEach((handler) => {
    try {
      handler(eventData)
    } catch (error) {
      console.error(`Error in event handler for ${eventType}:`, error)
    }
  })
}

/**
 * Send shift assignment notification
 */
async function handleShiftAssignment(event: ShiftAssignmentEvent) {
  console.log(`[Shift Assignment] Shift ${event.shiftId} assigned to ${event.workerName}`)

  const notification = {
    title: 'Shift Assigned',
    body: `You have been assigned to: ${event.shiftType} on ${event.shiftDate} at ${event.shiftTime}`,
    data: {
      type: 'shift',
      shiftId: event.shiftId,
      date: event.shiftDate,
      time: event.shiftTime,
      location: event.location,
      duration: event.duration,
      action: 'view_shift',
    },
  }

  // Send push notification to worker
  try {
    // In production, this would call the push notification service
    console.log(`Sending push notification to worker ${event.workerId}:`, notification)

    // Also notify farm owner
    await notifyOwner({
      title: 'Shift Assignment Notification',
      content: `${event.workerName} has been assigned to ${event.shiftType} on ${event.shiftDate}`,
    })
  } catch (error) {
    console.error('Error sending shift assignment notification:', error)
  }
}

/**
 * Send task assignment notification
 */
async function handleTaskAssignment(event: TaskAssignmentEvent) {
  console.log(`[Task Assignment] Task ${event.taskId} assigned to ${event.workerName}`)

  const notification = {
    title: 'New Task Assigned',
    body: `${event.taskTitle}: ${event.taskDescription}`,
    data: {
      type: 'task',
      taskId: event.taskId,
      priority: event.priority,
      dueDate: event.dueDate,
      estimatedHours: event.estimatedHours,
      action: 'view_task',
    },
  }

  try {
    console.log(`Sending push notification to worker ${event.workerId}:`, notification)

    await notifyOwner({
      title: 'Task Assignment Notification',
      content: `${event.workerName} has been assigned task: ${event.taskTitle}`,
    })
  } catch (error) {
    console.error('Error sending task assignment notification:', error)
  }
}

/**
 * Send task status change notification
 */
async function handleTaskStatusChange(event: TaskStatusChangeEvent) {
  console.log(
    `[Task Status Change] Task ${event.taskId} status changed from ${event.oldStatus} to ${event.newStatus}`
  )

  const statusMessages = {
    pending: 'Task is pending',
    in_progress: 'Task is now in progress',
    completed: 'Task has been completed',
    cancelled: 'Task has been cancelled',
  }

  const notification = {
    title: `Task ${event.newStatus === 'completed' ? 'Completed' : 'Updated'}`,
    body: `${event.taskTitle}: ${statusMessages[event.newStatus as keyof typeof statusMessages] || 'Status updated'}`,
    data: {
      type: 'task_update',
      taskId: event.taskId,
      oldStatus: event.oldStatus,
      newStatus: event.newStatus,
      timestamp: event.timestamp.toISOString(),
      action: 'view_task',
    },
  }

  try {
    console.log(`Sending task status update notification to worker ${event.workerId}:`, notification)
  } catch (error) {
    console.error('Error sending task status change notification:', error)
  }
}

/**
 * Send time-off approval notification
 */
async function handleTimeOffApproval(event: TimeOffApprovalEvent) {
  console.log(
    `[Time Off Approval] Request ${event.requestId} for ${event.workerName} has been ${event.status}`
  )

  const statusEmoji = event.status === 'approved' ? '✓' : event.status === 'rejected' ? '✗' : '⏳'
  const notification = {
    title: `Time Off ${event.status.charAt(0).toUpperCase() + event.status.slice(1)} ${statusEmoji}`,
    body: `Your time off request from ${event.startDate} to ${event.endDate} has been ${event.status}${event.reason ? `: ${event.reason}` : ''}`,
    data: {
      type: 'approval',
      requestId: event.requestId,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      action: 'view_request',
    },
  }

  try {
    console.log(`Sending time-off approval notification to worker ${event.workerId}:`, notification)

    await notifyOwner({
      title: 'Time Off Request Update',
      content: `${event.workerName}'s time off request has been ${event.status}`,
    })
  } catch (error) {
    console.error('Error sending time-off approval notification:', error)
  }
}

/**
 * Send bulk shift assignment notifications
 */
async function handleBulkShiftAssignment(events: ShiftAssignmentEvent[]) {
  console.log(`[Bulk Shift Assignment] Assigning ${events.length} shifts`)

  for (const event of events) {
    await handleShiftAssignment(event)
  }
}

/**
 * Send compliance alert notification
 */
async function handleComplianceAlert(workerId: number, workerName: string, alertType: string, details: string) {
  console.log(`[Compliance Alert] Alert for ${workerName}: ${alertType}`)

  const notification = {
    title: `Compliance Alert: ${alertType}`,
    body: details,
    data: {
      type: 'alert',
      severity: 'high',
      alertType,
      action: 'view_alert',
    },
  }

  try {
    console.log(`Sending compliance alert to worker ${workerId}:`, notification)

    await notifyOwner({
      title: 'Compliance Alert',
      content: `${workerName}: ${alertType} - ${details}`,
    })
  } catch (error) {
    console.error('Error sending compliance alert:', error)
  }
}

/**
 * Initialize event listeners
 */
export function initializeEventListeners() {
  addEventListener('shift:assigned', handleShiftAssignment)
  addEventListener('task:assigned', handleTaskAssignment)
  addEventListener('task:status_changed', handleTaskStatusChange)
  addEventListener('timeoff:approval', handleTimeOffApproval)
  addEventListener('shift:bulk_assigned', handleBulkShiftAssignment)
  addEventListener('compliance:alert', handleComplianceAlert)

  console.log('[Event Listeners] Initialized notification event handlers')
}

/**
 * Trigger shift assignment event
 */
export async function triggerShiftAssignmentEvent(event: ShiftAssignmentEvent) {
  emitEvent('shift:assigned', event)
}

/**
 * Trigger task assignment event
 */
export async function triggerTaskAssignmentEvent(event: TaskAssignmentEvent) {
  emitEvent('task:assigned', event)
}

/**
 * Trigger task status change event
 */
export async function triggerTaskStatusChangeEvent(event: TaskStatusChangeEvent) {
  emitEvent('task:status_changed', event)
}

/**
 * Trigger time-off approval event
 */
export async function triggerTimeOffApprovalEvent(event: TimeOffApprovalEvent) {
  emitEvent('timeoff:approval', event)
}

/**
 * Trigger bulk shift assignment event
 */
export async function triggerBulkShiftAssignmentEvent(events: ShiftAssignmentEvent[]) {
  emitEvent('shift:bulk_assigned', events)
}

/**
 * Trigger compliance alert event
 */
export async function triggerComplianceAlertEvent(
  workerId: number,
  workerName: string,
  alertType: string,
  details: string
) {
  emitEvent('compliance:alert', { workerId, workerName, alertType, details })
}

/**
 * tRPC Router for triggering notification events
 */
export const notificationEventHandlersRouter = router({
  /**
   * Trigger shift assignment notification
   */
  triggerShiftAssignment: protectedProcedure
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
      })
    )
    .mutation(async ({ input }) => {
      await triggerShiftAssignmentEvent(input)
      return { success: true, message: 'Shift assignment notification triggered' }
    }),

  /**
   * Trigger task assignment notification
   */
  triggerTaskAssignment: protectedProcedure
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
      })
    )
    .mutation(async ({ input }) => {
      await triggerTaskAssignmentEvent(input)
      return { success: true, message: 'Task assignment notification triggered' }
    }),

  /**
   * Trigger task status change notification
   */
  triggerTaskStatusChange: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        workerId: z.number(),
        workerName: z.string(),
        taskTitle: z.string(),
        oldStatus: z.string(),
        newStatus: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await triggerTaskStatusChangeEvent({
        ...input,
        timestamp: new Date(),
      })
      return { success: true, message: 'Task status change notification triggered' }
    }),

  /**
   * Trigger time-off approval notification
   */
  triggerTimeOffApproval: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        workerId: z.number(),
        workerName: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        status: z.enum(['approved', 'rejected', 'pending']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await triggerTimeOffApprovalEvent(input)
      return { success: true, message: 'Time-off approval notification triggered' }
    }),

  /**
   * Trigger bulk shift assignment notifications
   */
  triggerBulkShiftAssignment: protectedProcedure
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
      })
    )
    .mutation(async ({ input }) => {
      await triggerBulkShiftAssignmentEvent(input.shifts)
      return { success: true, message: `Bulk shift assignment notifications triggered for ${input.shifts.length} shifts` }
    }),

  /**
   * Trigger compliance alert notification
   */
  triggerComplianceAlert: protectedProcedure
    .input(
      z.object({
        workerId: z.number(),
        workerName: z.string(),
        alertType: z.string(),
        details: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await triggerComplianceAlertEvent(input.workerId, input.workerName, input.alertType, input.details)
      return { success: true, message: 'Compliance alert notification triggered' }
    }),
})
