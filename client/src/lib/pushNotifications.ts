/**
 * Push Notifications Service
 * Handles Web Push API integration for task assignments and updates
 */

export interface NotificationPayload {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
  data?: Record<string, any>
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface NotificationPreferences {
  enabled: boolean
  taskAssignments: boolean
  taskUpdates: boolean
  taskReminders: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

class PushNotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private preferences: NotificationPreferences = {
    enabled: true,
    taskAssignments: true,
    taskUpdates: true,
    taskReminders: true,
    soundEnabled: true,
    vibrationEnabled: true,
  }

  private notificationHistory: NotificationPayload[] = []

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported')
        return false
      }

      // Unregister all existing service workers
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName)
        }
      }

      // DO NOT register service worker - disabled for development
      // this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
      //   scope: '/',
      // })

      // Load preferences from localStorage
      this.loadPreferences()

      // Request notification permission
      if (Notification.permission === 'default') {
        await this.requestPermission()
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data)
      })

      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  /**
   * Send a notification
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Check if notifications are enabled
      if (!this.preferences.enabled) {
        console.warn('Notifications are disabled')
        return
      }

      // Check if in quiet hours
      if (this.isInQuietHours()) {
        console.warn('Currently in quiet hours')
        return
      }

      // Store in history
      this.notificationHistory.push(payload)

      // Send via service worker
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          badge: payload.badge || '/badge-72x72.png',
          tag: payload.tag,
          requireInteraction: payload.requireInteraction || false,
          actions: payload.actions,
          data: payload.data,
          vibrate: this.preferences.vibrationEnabled ? [200, 100, 200] : undefined,
        })

        // Play sound if enabled
        if (this.preferences.soundEnabled) {
          this.playNotificationSound()
        }
      } else {
        // Fallback to standard notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          tag: payload.tag,
        })
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  /**
   * Send task assignment notification
   */
  async notifyTaskAssignment(taskId: number, taskTitle: string, workerName: string): Promise<void> {
    if (!this.preferences.taskAssignments) return

    await this.sendNotification({
      id: `task-assign-${taskId}`,
      title: 'New Task Assigned',
      body: `${taskTitle} has been assigned to ${workerName}`,
      icon: '/task-icon.png',
      tag: 'task-assignment',
      data: {
        type: 'task_assignment',
        taskId,
      },
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  }

  /**
   * Send task update notification
   */
  async notifyTaskUpdate(taskId: number, taskTitle: string, status: string): Promise<void> {
    if (!this.preferences.taskUpdates) return

    await this.sendNotification({
      id: `task-update-${taskId}`,
      title: 'Task Updated',
      body: `${taskTitle} status changed to ${status}`,
      icon: '/task-icon.png',
      tag: 'task-update',
      data: {
        type: 'task_update',
        taskId,
        status,
      },
      actions: [
        { action: 'view', title: 'View Task' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  }

  /**
   * Send task reminder notification
   */
  async notifyTaskReminder(taskId: number, taskTitle: string, hoursUntilDue: number): Promise<void> {
    if (!this.preferences.taskReminders) return

    await this.sendNotification({
      id: `task-reminder-${taskId}`,
      title: 'Task Reminder',
      body: `${taskTitle} is due in ${hoursUntilDue} hours`,
      icon: '/task-icon.png',
      tag: 'task-reminder',
      requireInteraction: true,
      data: {
        type: 'task_reminder',
        taskId,
      },
      actions: [
        { action: 'start', title: 'Start Task' },
        { action: 'snooze', title: 'Snooze' },
      ],
    })
  }

  /**
   * Set notification preferences
   */
  setPreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences }
    this.savePreferences()
  }

  /**
   * Get notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  /**
   * Get notification history
   */
  getNotificationHistory(limit: number = 50): NotificationPayload[] {
    return this.notificationHistory.slice(-limit)
  }

  /**
   * Clear notification history
   */
  clearNotificationHistory(): void {
    this.notificationHistory = []
  }

  /**
   * Check if currently in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.preferences.quietHoursStart || !this.preferences.quietHoursEnd) {
      return false
    }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = this.preferences.quietHoursStart.split(':').map(Number)
    const [endHour, endMin] = this.preferences.quietHoursEnd.split(':').map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences))
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    const saved = localStorage.getItem('notificationPreferences')
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) }
      } catch (error) {
        console.warn('Failed to load notification preferences:', error)
      }
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(data: any): void {
    console.log('Message from service worker:', data)

    if (data.type === 'notification_click') {
      // Handle notification click
      if (data.action === 'view' && data.taskId) {
        window.location.href = `/field-worker/tasks/${data.taskId}`
      }
    }
  }
}

export const pushNotificationService = new PushNotificationService()
