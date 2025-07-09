"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAvailableCurrencies, DEFAULT_CURRENCY } from "@/lib/currency"

export function ProfileSettings() {
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const { toast } = useToast()

  const availableCurrencies = getAvailableCurrencies()

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
            {availableCurrencies.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.displayName}
              </SelectItem>
            ))}
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
