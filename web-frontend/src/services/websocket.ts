import { toast } from 'sonner'

export interface WebSocketMessage {
  type: 'inventory_update' | 'sale_created' | 'product_updated' | 'low_stock_alert' | 'order_status' | 'system_notification'
  data: any
  timestamp: string
  id: string
}

export interface NotificationItem {
  id: string
  type: WebSocketMessage['type']
  title: string
  message: string
  timestamp: Date
  read: boolean
  data?: any
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private listeners: Map<string, ((message: WebSocketMessage) => void)[]> = new Map()
  private notificationListeners: ((notification: NotificationItem) => void)[] = []
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.setupEventListeners()
  }

  connect(url: string, token: string, tenantId: string) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true
    const wsUrl = `${url}?token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(tenantId)}`
    
    try {
      this.ws = new WebSocket(wsUrl)
      this.setupWebSocket()
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  private setupWebSocket() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.startHeartbeat()
      
      toast.success('Real-time updates enabled')
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.isConnecting = false
      this.stopHeartbeat()
      
      if (event.code !== 1000) { // Not a normal closure
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.isConnecting = false
    }
  }

  private handleMessage(message: WebSocketMessage) {
    // Notify all type-specific listeners
    const typeListeners = this.listeners.get(message.type) || []
    typeListeners.forEach(listener => {
      try {
        listener(message)
      } catch (error) {
        console.error('Error in WebSocket listener:', error)
      }
    })

    // Convert to notification and notify notification listeners
    const notification = this.messageToNotification(message)
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })

    // Show toast notification for important messages
    this.showToastNotification(message)
  }

  private messageToNotification(message: WebSocketMessage): NotificationItem {
    const notification: NotificationItem = {
      id: message.id,
      type: message.type,
      title: this.getNotificationTitle(message.type),
      message: this.getNotificationMessage(message),
      timestamp: new Date(message.timestamp),
      read: false,
      data: message.data
    }

    return notification
  }

  private getNotificationTitle(type: WebSocketMessage['type']): string {
    switch (type) {
      case 'inventory_update':
        return 'Inventory Updated'
      case 'sale_created':
        return 'New Sale'
      case 'product_updated':
        return 'Product Updated'
      case 'low_stock_alert':
        return 'Low Stock Alert'
      case 'order_status':
        return 'Order Status Update'
      case 'system_notification':
        return 'System Notification'
      default:
        return 'Notification'
    }
  }

  private getNotificationMessage(message: WebSocketMessage): string {
    switch (message.type) {
      case 'inventory_update':
        const { product_name, location, quantity } = message.data
        return `${product_name} at ${location} updated to ${quantity} units`
      case 'sale_created':
        return `Sale #${message.data.id} completed - $${message.data.total}`
      case 'product_updated':
        return `${message.data.name} has been updated`
      case 'low_stock_alert':
        return `${message.data.product_name} is running low (${message.data.quantity} left)`
      case 'order_status':
        return `Order #${message.data.order_id} status: ${message.data.status}`
      case 'system_notification':
        return message.data.message || 'System update'
      default:
        return 'New update available'
    }
  }

  private showToastNotification(message: WebSocketMessage) {
    switch (message.type) {
      case 'low_stock_alert':
        toast.warning(this.getNotificationMessage(message), {
          duration: 5000,
          action: {
            label: 'View Inventory',
            onClick: () => {
              window.location.href = '/inventory'
            }
          }
        })
        break
      case 'sale_created':
        toast.success(this.getNotificationMessage(message), {
          duration: 3000,
          action: {
            label: 'View Sale',
            onClick: () => {
              window.location.href = `/sales/${message.data.id}`
            }
          }
        })
        break
      case 'inventory_update':
        toast.info(this.getNotificationMessage(message), {
          duration: 3000
        })
        break
      case 'system_notification':
        toast(this.getNotificationMessage(message), {
          duration: 4000
        })
        break
      default:
        // Don't show toast for other message types by default
        break
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      toast.error('Real-time updates disconnected. Please refresh the page.')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    setTimeout(() => {
      this.reconnectAttempts++
      // Reconnect with stored credentials - you'll need to store these
      // This is a simplified version - in production, you'd get fresh credentials
      toast.info('Attempting to reconnect real-time updates...')
    }, delay)
  }

  // Public API methods
  onMessage(type: WebSocketMessage['type'], listener: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  onNotification(listener: (notification: NotificationItem) => void) {
    this.notificationListeners.push(listener)

    // Return unsubscribe function
    return () => {
      const index = this.notificationListeners.indexOf(listener)
      if (index > -1) {
        this.notificationListeners.splice(index, 1)
      }
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  private setupEventListeners() {
    // Handle page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopHeartbeat()
        } else if (this.isConnected()) {
          this.startHeartbeat()
        }
      })
    }

    // Handle page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect()
      })
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()

// Hook for React components
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(websocketService.isConnected())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const connect = useCallback((url: string, token: string, tenantId: string) => {
    websocketService.connect(url, token, tenantId)
  }, [])

  const disconnect = useCallback(() => {
    websocketService.disconnect()
  }, [])

  const onMessage = useCallback((type: WebSocketMessage['type'], listener: (message: WebSocketMessage) => void) => {
    return websocketService.onMessage(type, listener)
  }, [])

  const onNotification = useCallback((listener: (notification: NotificationItem) => void) => {
    return websocketService.onNotification(listener)
  }, [])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Listen for new notifications
  useEffect(() => {
    const unsubscribe = websocketService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep only last 50
    })

    return unsubscribe
  }, [])

  return {
    isConnected,
    notifications,
    connect,
    disconnect,
    onMessage,
    onNotification,
    markAsRead,
    clearNotifications
  }
}

// Import useState and useCallback for the hook
import { useState, useCallback, useEffect } from 'react'
