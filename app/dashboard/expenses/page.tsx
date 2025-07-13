
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
        <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
        <p className="text-muted-foreground">Acompanhe e gerencie suas despesas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Despesa</CardTitle>
            <CardDescription>Registre uma nova despesa com detalhes</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas Recentes</CardTitle>
            <CardDescription>Seus últimos lançamentos de despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

