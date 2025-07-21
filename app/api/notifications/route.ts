import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`)

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

    // Fetch pending friend requests
    const pendingFriendRequests = await sql`
      SELECT
        id,
        user_id as sender_id,
        (SELECT display_name FROM users WHERE id = user_id) as sender_name,
        created_at
      FROM friends
      WHERE friend_user_id = ${userId} AND status = 'pending';
    `;

    // Add friend request notifications (expire after 7 days)
    pendingFriendRequests.forEach(request => {
      const daysSinceRequest = Math.floor((Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceRequest <= 7) { // Only show requests from last 7 days
        notifications.push({
          id: `friend-request-${request.id}`,
          type: "info",
          title: "Novo Pedido de Amizade",
          message: `${request.sender_name || 'Um usuário'} quer ser seu amigo.`,
          timestamp: request.created_at.toISOString(),
        });
      }
    });

    // Fetch unsettled shared expenses where current user is shared_with_user_id
    const unsettledSharedExpenses = await sql`
      SELECT
        id,
        description,
        total_amount,
        paid_by_user_id,
        (SELECT display_name FROM users WHERE id = paid_by_user_id) as paid_by_user_name,
        created_at
      FROM shared_expenses
      WHERE shared_with_user_id = ${userId} AND status = 'unsettled';
    `;

    // Add shared expense notifications (expire after 7 days)
    unsettledSharedExpenses.forEach(expense => {
      const daysSinceExpense = Math.floor((Date.now() - new Date(expense.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceExpense <= 7) { // Only show expenses from last 7 days
        notifications.push({
          id: `shared-expense-${expense.id}`,
          type: "info",
          title: "Nova Despesa Compartilhada",
          message: `${expense.paid_by_user_name || 'Um usuário'} compartilhou uma despesa de R${Number(expense.total_amount).toFixed(2)} com você.`,
          timestamp: expense.created_at.toISOString(),
        });
      }
    });
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
    // Spending alerts
    if (spentAmount > budgetAmount) {
      notifications.push({
        id: "spending-over-budget",
        type: "error",
        title: "Excesso de Gastos",
        message: `Você gastou R$${spentAmount.toFixed(2)}, que excede seu orçamento de R$${budgetAmount.toFixed(2)}`,
        timestamp: new Date().toISOString(),
      })
    }
    else if (spentAmount > 0) {
      notifications.push({
        id: "spending-update",
        type: "info",
        title: "Atualização de Gastos",
        message: `Você gastou R$${spentAmount.toFixed(2)} este mês`,
        timestamp: new Date().toISOString(),
      })
    }
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}