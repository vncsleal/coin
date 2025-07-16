
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { DashboardStats } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseChart } from "@/components/expense-chart"
import { ExpensePieChart } from "@/components/expense-pie-chart"
import { DollarSign, TrendingUp, Target, TrendingDown, Scale } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { AICounselingModal } from "@/components/AICounselingModal"
import { IncomeChart } from "@/components/income-chart"

async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Get monthly income data for chart
  const monthlyIncomes = await sql`
    SELECT DATE(date) as date, SUM(amount) as amount
    FROM incomes
    WHERE user_id = ${userId}
    AND EXTRACT(MONTH FROM date) = ${currentMonth}
    AND EXTRACT(YEAR FROM date) = ${currentYear}
    GROUP BY DATE(date)
    ORDER BY date
  `

  // Get total monthly income
  const monthlyIncomeTotal = await sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM incomes
    WHERE user_id = ${userId}
    AND EXTRACT(MONTH FROM date) = ${currentMonth}
    AND EXTRACT(YEAR FROM date) = ${currentYear}
  `

  // Get current month expenses for chart
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

  const totalIncome = Number(monthlyIncomeTotal[0]?.total || 0)
  const totalExpenditure = Number(monthlyExpenditure[0]?.total || 0)
  const currentBudget = Number(budget[0]?.amount || 0)
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const dailyAverage = totalExpenditure / daysInMonth

  return {
    monthlyIncome: totalIncome,
    monthlyExpenditure: totalExpenditure,
    dailyAverage,
    currentBudget,
    remainingBudget: currentBudget - totalExpenditure,
    netBalance: totalIncome - totalExpenditure,
    monthlyIncomes: monthlyIncomes.map((row) => ({
      date: row.date,
      amount: Number(row.amount),
    })),
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
        <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
        <p className="text-muted-foreground">Visão geral da sua atividade financeira neste mês</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
            </div>
            <AICounselingModal counselingType="monthly_income" data={stats} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Despesa Mensal</CardTitle>
            </div>
            <AICounselingModal counselingType="monthly_expenditure" data={stats} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.monthlyExpenditure)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
            </div>
            <AICounselingModal counselingType="net_balance" data={stats} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netBalance < 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(stats.netBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-.between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Orçamento Restante</CardTitle>
            </div>
            <AICounselingModal counselingType="remaining_budget" data={stats} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(stats.remainingBudget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            </div>
            <AICounselingModal counselingType="daily_average" data={stats} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.dailyAverage)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rendas Mensais</CardTitle>
              <CardDescription>Suas fontes de renda ao longo do mês</CardDescription>
            </div>
            <AICounselingModal counselingType="monthly_incomes_chart" data={stats} />
          </CardHeader>
          <CardContent className="pl-2">
            <IncomeChart data={stats.monthlyIncomes} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Despesas Mensais</CardTitle>
              <CardDescription>Seus gastos diários ao longo do mês</CardDescription>
            </div>
            <AICounselingModal counselingType="monthly_expenses_chart" data={stats} />
          </CardHeader>
          <CardContent className="pl-2">
            <ExpenseChart data={stats.monthlyExpenses} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>Detalhamento do mês atual</CardDescription>
            </div>
            <AICounselingModal counselingType="expenses_by_category_chart" data={stats} />
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={stats.expensesByTag} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Total de Despesas por Categoria</CardTitle>
              <CardDescription>Detalhamento de gastos de todos os tempos</CardDescription>
            </div>
            <AICounselingModal counselingType="total_expenses_by_category_chart" data={stats} />
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={stats.totalExpensesByTag} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

