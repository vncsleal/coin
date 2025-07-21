"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Notification {
  id: string
  type: "warning" | "info" | "success"
  title: string
  message: string
  timestamp: string
  notification_type?: 'friend_request' | 'budget_alert' | 'spending_alert' | 'shared_expense'; // Added shared_expense type
  sender_id?: string; // For friend requests
  sender_name?: string; // For friend requests
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<Date>(new Date())
  const [isUserActive, setIsUserActive] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'deny') => {
    try {
      const response = await fetch(`/api/friends/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${action} friend request`);
      }
      // Remove the notification after action
      setNotifications(prev => prev.filter(notif => notif.id !== `friend-request-${requestId}`));
      // Optionally, show a toast message
      // toast.success(`Friend request ${action}ed!`);
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      // toast.error(`Failed to ${action} friend request.`);
    }
  };

  // Track user activity for smart polling
  useEffect(() => {
    const handleActivity = () => setIsUserActive(true)
    const handleInactivity = () => setIsUserActive(false)

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => document.addEventListener(event, handleActivity, true))

    // Set user as inactive after 2 minutes of no activity (shorter timeout)
    const inactivityTimer = setTimeout(handleInactivity, 2 * 60 * 1000)

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity, true))
      clearTimeout(inactivityTimer)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setLastFetch(new Date())
      } else {
        console.error("Failed to fetch notifications:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Smart polling based on user activity and data freshness
  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Set up polling interval
    const setupPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Determine polling frequency - much more sparse intervals
      const now = new Date()
      const timeSinceLastFetch = now.getTime() - lastFetch.getTime()
      const fifteenMinutes = 15 * 60 * 1000
      
      let pollInterval: number
      if (!isUserActive) {
        pollInterval = 60 * 60 * 1000 // 1 hour when inactive
      } else if (timeSinceLastFetch > fifteenMinutes) {
        pollInterval = 10 * 60 * 1000 // 10 minutes if data is getting stale
      } else {
        pollInterval = 15 * 60 * 1000 // 15 minutes normal polling for active users
      }

      intervalRef.current = setInterval(fetchNotifications, pollInterval)
    }

    setupPolling()

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isUserActive, lastFetch, fetchNotifications])

  // Fetch immediately when user becomes active
  useEffect(() => {
    if (isUserActive) {
      const timeSinceLastFetch = new Date().getTime() - lastFetch.getTime()
      const tenMinutes = 10 * 60 * 1000
      
      // If data is older than 10 minutes and user just became active, fetch immediately
      if (timeSinceLastFetch > tenMinutes) {
        fetchNotifications()
      }
    }
  }, [isUserActive, lastFetch, fetchNotifications])

  

  function getIcon(type: string) {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notificações</h4>
            <Badge variant="secondary">{notifications.length} novas</Badge>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando notificações...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sem notificações</p>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className="p-3">
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(notification.timestamp).toLocaleDateString()}</p>
                      {notification.notification_type === 'friend_request' && (
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" onClick={() => handleFriendRequest(notification.id.replace('friend-request-', ''), 'accept')}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleFriendRequest(notification.id.replace('friend-request-', ''), 'deny')}>Deny</Button>
                        </div>
                      )}
                      {notification.notification_type === 'shared_expense' && (
                        <div className="flex space-x-2 mt-2">
                          {/* Add actions for shared expenses if needed, e.g., "View Expense" */}
                          <Button size="sm" onClick={() => window.location.href = '/dashboard/shared-expenses'}>Ver Despesa</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
