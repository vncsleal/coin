"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, X, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Notification {
  id: string
  type: "warning" | "info" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "Budget Alert",
      message: "You've spent 85% of your monthly budget",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "Weekly Summary",
      message: "Your weekly spending report is ready",
      timestamp: new Date(Date.now() - 86400000),
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "Goal Achieved",
      message: "You stayed under budget last month!",
      timestamp: new Date(Date.now() - 172800000),
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

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
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            <Badge variant="secondary">{unreadCount} new</Badge>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={`p-3 ${!notification.read ? "bg-muted/50" : ""}`}>
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.timestamp.toLocaleDateString()}</p>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
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
