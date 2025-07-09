import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getExpenses(userId: string): Promise<Expense[]> {
  const expenses = await sql`
    SELECT * FROM expenses 
    WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC
  `

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }))
}

export default async function ExpensesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const expenses = await getExpenses(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your expenses</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>Record a new expense with details</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest expense entries</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
