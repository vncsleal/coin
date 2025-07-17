'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export function AmountVisibilityToggle() {
  const [showAmounts, setShowAmounts] = useState(false)

  // Load preference from localStorage on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('show-amounts')
    if (savedPreference !== null) {
      setShowAmounts(JSON.parse(savedPreference))
    }
  }, [])

  // Save preference to localStorage when it changes
  const toggleShowAmounts = () => {
    const newValue = !showAmounts
    setShowAmounts(newValue)
    localStorage.setItem('show-amounts', JSON.stringify(newValue))
    
    // Dispatch custom event to notify dashboard
    window.dispatchEvent(new CustomEvent('amountVisibilityChange', { 
      detail: { showAmounts: newValue } 
    }))
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleShowAmounts}
      className="relative"
    >
      {showAmounts ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  )
}
