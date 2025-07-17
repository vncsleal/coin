
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { DashboardStats } from "@/lib/types"
import { DashboardClient } from "@/components/dashboard-client"

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
  // Get monthly expenditure from individual expenses
  const monthlyIndividualExpenditure = await sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses 
    WHERE user_id = ${userId}
    AND EXTRACT(MONTH FROM date) = ${currentMonth}
    AND EXTRACT(YEAR FROM date) = ${currentYear}
  `

  // Get monthly shared expenditure (user's portion)
  const monthlySharedExpenditureResult = await sql`
    SELECT
      COALESCE(SUM(CASE
        WHEN paid_by_user_id = ${userId} THEN total_amount / 2
        WHEN shared_with_user_id = ${userId} THEN total_amount / 2
        ELSE 0
      END), 0) as total
    FROM shared_expenses
    WHERE (paid_by_user_id = ${userId} OR shared_with_user_id = ${userId})
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
  const totalIndividualExpenditure = Number(monthlyIndividualExpenditure[0]?.total || 0)
  const totalSharedExpenditure = Number(monthlySharedExpenditureResult[0]?.total || 0)
  const totalExpenditure = totalIndividualExpenditure + totalSharedExpenditure
  const currentBudget = Number(budget[0]?.amount || 0)
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const dailyAverage = totalExpenditure / daysInMonth

  return {
    monthlyIncome: totalIncome,
    monthlyExpenditure: totalIndividualExpenditure,
    monthlySharedExpenditure: totalSharedExpenditure,
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

  return <DashboardClient stats={stats} />
}

