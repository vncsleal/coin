
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { ExpenseAnalytics } from "@/components/expense-analytics"

async function getExpenses(userId: string): Promise<Expense[]> {
  const expenses = await sql`
    SELECT * FROM expenses 
    WHERE user_id = ${userId}
    ORDER BY date DESC
  `

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  })) as Expense[]
}

export default async function AnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const expenses = await getExpenses(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
        <p className="text-muted-foreground">Insights profundos sobre seus padrões e tendências de gastos</p>
      </div>

      <ExpenseAnalytics expenses={expenses} />
    </div>
  )
}

