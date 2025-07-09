"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import type { Expense } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

interface ExpenseAnalyticsProps {
  expenses: Expense[]
}

export function ExpenseAnalytics({ expenses }: ExpenseAnalyticsProps) {
  // Calculate monthly trends
  const monthlyTrends = expenses.reduce(
    (acc, expense) => {
      const month = new Date(expense.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyData = Object.entries(monthlyTrends)
    .map(([month, amount]) => ({ month, amount }))
    .slice(-12) // Last 12 months

  // Calculate category spending
  const categorySpending = expenses.reduce(
    (acc, expense) => {
      acc[expense.tag] = (acc[expense.tag] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categorySpending)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Calculate weekly spending pattern
  const weeklyPattern = expenses.reduce(
    (acc, expense) => {
      const dayOfWeek = new Date(expense.date).toLocaleDateString("en-US", { weekday: "long" })
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const weeklyData = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({
    day,
    amount: weeklyPattern[day] || 0,
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trends</CardTitle>
          <CardDescription>Your spending patterns over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Total spending breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(Number(value))} />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Spending Pattern</CardTitle>
          <CardDescription>Average spending by day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
              <Bar dataKey="amount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Summary</CardTitle>
          <CardDescription>Key statistics about your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Expenses</span>
              <span className="text-sm font-bold">
                {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Average per Transaction</span>
              <span className="text-sm font-bold">
                {expenses.length > 0
                  ? formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length)
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Highest Single Expense</span>
              <span className="text-sm font-bold">
                {expenses.length > 0 ? formatCurrency(Math.max(...expenses.map((exp) => exp.amount))) : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Most Frequent Category</span>
              <span className="text-sm font-bold">{categoryData.length > 0 ? categoryData[0].category : "None"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
