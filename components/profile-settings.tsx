"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export function ProfileSettings() {
  const [currency, setCurrency] = useState("USD")
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const { toast } = useToast()

  function handleSave() {
    // In a real app, you'd save these to a user preferences table
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currency">Default Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
            <SelectItem value="JPY">JPY (¥)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Email Notifications</Label>
        <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="darkMode">Dark Mode</Label>
        <Switch id="darkMode" checked={darkMode} onCheckedChange={setDarkMode} />
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Preferences
      </Button>
    </div>
  )
}
