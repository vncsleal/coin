"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SharedExpense } from "@/lib/types"

export function SharedExpenseList() {
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSharedExpenses() {
      try {
        const response = await fetch("/api/shared-expenses")
        if (response.ok) {
          const data = await response.json()
          setSharedExpenses(data)
        }
      } catch (error) {
        console.error("Failed to fetch shared expenses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSharedExpenses()
  }, [])

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading shared expenses...</div>
  }

  if (sharedExpenses.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No shared expenses yet</div>
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {sharedExpenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{expense.name}</span>
                  <Badge variant="secondary">{expense.tag}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(expense.date).toLocaleDateString()} • {expense.participants.length} participants
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${expense.total_amount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  Your share: ${(expense.total_amount / expense.participants.length).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
