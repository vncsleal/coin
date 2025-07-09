import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { Budget } from "@/lib/types"
import { BudgetForm } from "@/components/budget-form"
import { BudgetOverview } from "@/components/budget-overview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getCurrentBudget(userId: string): Promise<Budget | null> {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const budget = await sql`
    SELECT * FROM budgets 
    WHERE user_id = ${userId} 
    AND month = ${currentMonth} 
    AND year = ${currentYear}
  `

  return budget[0]
    ? {
        ...budget[0],
        amount: Number(budget[0].amount),
      }
    : null
}

export default async function BudgetPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const currentBudget = await getCurrentBudget(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
        <p className="text-muted-foreground">Set and track your monthly budget</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Set Monthly Budget</CardTitle>
            <CardDescription>
              {currentBudget ? "Update your current budget" : "Set your budget for this month"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm currentBudget={currentBudget} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Track your spending against your budget</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetOverview budget={currentBudget} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
