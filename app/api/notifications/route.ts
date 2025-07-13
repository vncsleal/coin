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
          title: "Alerta de Orçamento",
          message: `Você gastou ${percentage.toFixed(1)}% do seu orçamento mensal`,
          timestamp: new Date().toISOString(),
        })
      } else if (percentage >= 75) {
        notifications.push({
          id: "budget-75",
          type: "info",
          title: "Atualização de Orçamento",
          message: `Você gastou ${percentage.toFixed(1)}% do seu orçamento mensal`,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // New Friend Requests
    const friendRequests = await sql`
      SELECT f.id, u.name, u.email
      FROM friends f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_user_id = ${userId} AND f.status = 'pending'
    `

    friendRequests.forEach(request => {
      notifications.push({
        id: `friend-request-${request.id}`,
        type: "info",
        title: "Nova Solicitação de Amizade",
        message: `${request.name || request.email} enviou uma solicitação de amizade.`,
        timestamp: new Date().toISOString(),
      })
    })

    // Pending Shared Expense Settlements
    const pendingSettlements = await sql`
      SELECT ses.id, se.name as expense_name, u.name as payer_name, u.email as payer_email
      FROM shared_expense_settlements ses
      JOIN shared_expenses se ON ses.shared_expense_id = se.id
      JOIN users u ON se.created_by = u.id
      WHERE ses.participant_id = ${userId} AND ses.status = 'pending'
    `

    pendingSettlements.forEach(settlement => {
      notifications.push({
        id: `settlement-pending-${settlement.id}`,
        type: "warning",
        title: "Liquidação Pendente",
        message: `Você tem uma liquidação pendente para a despesa "${settlement.expense_name}" com ${settlement.payer_name || settlement.payer_email}.`,
        timestamp: new Date().toISOString(),
      })
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
