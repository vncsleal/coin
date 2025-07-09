import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { DashboardStats } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseChart } from "@/components/expense-chart"
import { ExpensePieChart } from "@/components/expense-pie-chart"
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Get current month expenses
  const monthlyExpenses = await sql`
    SELECT DATE(date) as date, SUM(amount) as amount
    FROM expenses 
    WHERE user_id = ${userId} 
    AND EXTRACT(MONTH FROM date) = ${currentMonth}
    AND EXTRACT(YEAR FROM date) = ${currentYear}
    GROUP BY DATE(date)
    ORDER BY date
  `

  // Get monthly expenditure
  const monthlyExpenditure = await sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses 
    WHERE user_id = ${userId}
    AND EXTRACT(MONTH FROM date) = ${currentMonth}
    AND EXTRACT(YEAR FROM date) = ${currentYear}
  `

  // Get current budget
  const budget = await sql`
    SELECT amount FROM budgets 
    WHERE user_id = ${userId} 
    AND month = ${currentMonth} 
    AND year = ${currentYear}
  `

  // Get expenses by tag for current month
  const expensesByTag = await sql`
    SELECT tag, SUM(amount) as amount
    FROM expenses 
    WHERE user_id = ${userId}
    AND EXTRACT(MONTH FROM date) = ${currentMonth}
    AND EXTRACT(YEAR FROM date) = ${currentYear}
    GROUP BY tag
    ORDER BY amount DESC
  `

  // Get total expenses by tag
  const totalExpensesByTag = await sql`
    SELECT tag, SUM(amount) as amount
    FROM expenses 
    WHERE user_id = ${userId}
    GROUP BY tag
    ORDER BY amount DESC
  `

  const totalExpenditure = Number(monthlyExpenditure[0]?.total || 0)
  const currentBudget = Number(budget[0]?.amount || 0)
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const dailyAverage = totalExpenditure / daysInMonth

  return {
    monthlyExpenditure: totalExpenditure,
    dailyAverage,
    currentBudget,
    remainingBudget: currentBudget - totalExpenditure,
    monthlyExpenses: monthlyExpenses.map((row) => ({
      date: row.date,
      amount: Number(row.amount),
    })),
    expensesByTag: expensesByTag.map((row) => ({
      tag: row.tag,
      amount: Number(row.amount),
    })),
    totalExpensesByTag: totalExpensesByTag.map((row) => ({
      tag: row.tag,
      amount: Number(row.amount),
    })),
  }
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const stats = await getDashboardStats(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your financial activity this month</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenditure</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyExpenditure)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.dailyAverage)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.currentBudget)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(stats.remainingBudget)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Your daily spending throughout the month</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ExpenseChart data={stats.monthlyExpenses} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={stats.expensesByTag} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Expenses by Category</CardTitle>
          <CardDescription>All-time spending breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensePieChart data={stats.totalExpensesByTag} />
        </CardContent>
      </Card>
    </div>
  )
}
