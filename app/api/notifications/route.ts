import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get current month budget and spending
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const budget = await sql`
      SELECT amount FROM budgets 
      WHERE user_id = ${userId} 
      AND month = ${currentMonth} 
      AND year = ${currentYear}
    `

    const spending = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses 
      WHERE user_id = ${userId}
      AND EXTRACT(MONTH FROM date) = ${currentMonth}
      AND EXTRACT(YEAR FROM date) = ${currentYear}
    `

    const notifications = []
    const budgetAmount = Number(budget[0]?.amount || 0)
    const spentAmount = Number(spending[0]?.total || 0)

    // Budget alerts
    if (budgetAmount > 0) {
      const percentage = (spentAmount / budgetAmount) * 100

      if (percentage >= 90) {
        notifications.push({
          id: "budget-90",
          type: "warning",
          title: "Budget Alert",
          message: `You've spent ${percentage.toFixed(1)}% of your monthly budget`,
          timestamp: new Date(),
          read: false,
        })
      } else if (percentage >= 75) {
        notifications.push({
          id: "budget-75",
          type: "info",
          title: "Budget Update",
          message: `You've spent ${percentage.toFixed(1)}% of your monthly budget`,
          timestamp: new Date(),
          read: false,
        })
      }
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
