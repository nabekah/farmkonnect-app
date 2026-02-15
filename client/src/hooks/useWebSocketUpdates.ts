import { useEffect, useRef, useCallback, useState } from 'react'

interface WebSocketMessage {
  type: string
  channel?: string
  payload: any
  timestamp: number
}

interface UseWebSocketUpdatesOptions {
  userId: number
  farmId: number
  channels?: string[]
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
  autoReconnect?: boolean
  reconnectDelay?: number
  maxReconnectAttempts?: number
}

/**
 * Hook for WebSocket real-time updates
 * Handles connection, subscriptions, and message handling
 */
export const useWebSocketUpdates = (options: UseWebSocketUpdatesOptions) => {
  const {
    userId,
    farmId,
    channels = [],
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set(channels))

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${userId}&farmId=${farmId}`

      console.log('[WebSocket] Connecting to:', wsUrl)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('[WebSocket] Connected')
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        onConnect?.()

        // Subscribe to channels
        subscribedChannels.forEach((channel) => {
          subscribe(channel)
        })
      }

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage

          if (message.type === 'connected') {
            console.log('[WebSocket] Connected:', message.payload)
          } else if (message.type === 'subscribed') {
            console.log('[WebSocket] Subscribed to:', message.payload.channel)
          } else if (message.type === 'pong') {
            // Heartbeat response
          } else {
            onMessage?.(message)
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error)
        }
      }

      ws.onerror = (error: Event) => {
        console.error('[WebSocket] Error:', error)
        onError?.(new Error('WebSocket error'))
      }

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected')
        setIsConnected(false)
        onDisconnect?.()

        // Attempt to reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1)
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      onError?.(error as Error)
    }
  }, [userId, farmId, subscribedChannels, onMessage, onError, onConnect, onDisconnect, autoReconnect, reconnectDelay, maxReconnectAttempts])

  /**
   * Subscribe to a channel
   */
  const subscribe = useCallback((channel: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot subscribe: not connected')
      return
    }

    wsRef.current.send(JSON.stringify({ type: 'subscribe', payload: { channel } }))
    setSubscribedChannels((prev) => new Set([...prev, channel]))
  }, [])

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = useCallback((channel: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot unsubscribe: not connected')
      return
    }

    wsRef.current.send(JSON.stringify({ type: 'unsubscribe', payload: { channel } }))
    setSubscribedChannels((prev) => {
      const next = new Set(prev)
      next.delete(channel)
      return next
    })
  }, [])

  /**
   * Send ping to keep connection alive
   */
  const ping = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    wsRef.current.send(JSON.stringify({ type: 'ping' }))
  }, [])

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
  }, [])

  // Connect on mount
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Heartbeat to keep connection alive
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      ping()
    }, 30000)

    return () => clearInterval(heartbeatInterval)
  }, [ping])

  return {
    isConnected,
    subscribe,
    unsubscribe,
    disconnect,
    subscribedChannels: Array.from(subscribedChannels),
  }
}

/**
 * Hook for task updates
 */
export const useTaskUpdates = (farmId: number, userId: number, onUpdate?: (data: any) => void) => {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'task_update') {
        console.log('[Task Update]', message.payload)
        setTasks((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((t) => t.id === message.payload.taskId)
          if (index >= 0) {
            updated[index] = { ...updated[index], ...message.payload.data }
          }
          return updated
        })
        onUpdate?.(message.payload)
      } else if (message.type === 'task_status_change') {
        console.log('[Task Status Change]', message.payload)
        setTasks((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((t) => t.id === message.payload.taskId)
          if (index >= 0) {
            updated[index] = { ...updated[index], status: message.payload.newStatus }
          }
          return updated
        })
        onUpdate?.(message.payload)
      }
    },
    [onUpdate]
  )

  const ws = useWebSocketUpdates({
    userId,
    farmId,
    channels: [`farm:${farmId}:tasks`],
    onMessage: handleMessage,
  })

  return {
    tasks,
    setTasks,
    loading,
    setLoading,
    isConnected: ws.isConnected,
  }
}

/**
 * Hook for shift updates
 */
export const useShiftUpdates = (farmId: number, userId: number, onUpdate?: (data: any) => void) => {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'shift_update') {
        console.log('[Shift Update]', message.payload)
        setShifts((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((s) => s.id === message.payload.shiftId)
          if (index >= 0) {
            updated[index] = { ...updated[index], ...message.payload.data }
          }
          return updated
        })
        onUpdate?.(message.payload)
      } else if (message.type === 'shift_assigned') {
        console.log('[Shift Assigned]', message.payload)
        setShifts((prev) => [...prev, message.payload.data])
        onUpdate?.(message.payload)
      }
    },
    [onUpdate]
  )

  const ws = useWebSocketUpdates({
    userId,
    farmId,
    channels: [`farm:${farmId}:shifts`],
    onMessage: handleMessage,
  })

  return {
    shifts,
    setShifts,
    loading,
    setLoading,
    isConnected: ws.isConnected,
  }
}

/**
 * Hook for worker availability updates
 */
export const useWorkerAvailabilityUpdates = (
  farmId: number,
  userId: number,
  onUpdate?: (data: any) => void
) => {
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'worker_availability_update') {
        console.log('[Worker Availability Update]', message.payload)
        setWorkers((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((w) => w.id === message.payload.workerId)
          if (index >= 0) {
            updated[index] = { ...updated[index], availability: message.payload.availability }
          }
          return updated
        })
        onUpdate?.(message.payload)
      }
    },
    [onUpdate]
  )

  const ws = useWebSocketUpdates({
    userId,
    farmId,
    channels: [`farm:${farmId}:workers`],
    onMessage: handleMessage,
  })

  return {
    workers,
    setWorkers,
    loading,
    setLoading,
    isConnected: ws.isConnected,
  }
}

/**
 * Hook for notifications
 */
export const useNotifications = (userId: number, farmId: number, onNotification?: (data: any) => void) => {
  const [notifications, setNotifications] = useState<any[]>([])

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      if (message.type === 'notification') {
        console.log('[Notification]', message.payload)
        setNotifications((prev) => [message.payload, ...prev])
        onNotification?.(message.payload)
      }
    },
    [onNotification]
  )

  const ws = useWebSocketUpdates({
    userId,
    farmId,
    onMessage: handleMessage,
  })

  return {
    notifications,
    setNotifications,
    isConnected: ws.isConnected,
  }
}
