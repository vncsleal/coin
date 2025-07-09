import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const sharedExpenses = await sql`
      SELECT 
        se.*,
        json_agg(
          json_build_object(
            'id', sep.id,
            'user_id', sep.user_id,
            'share_amount', sep.share_amount
          )
        ) as participants
      FROM shared_expenses se
      JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
      WHERE sep.user_id = ${userId}
      GROUP BY se.id
      ORDER BY se.created_at DESC
    `

    const formattedExpenses = sharedExpenses.map((expense) => ({
      ...expense,
      total_amount: Number(expense.total_amount),
      participants: expense.participants.map((p: { share_amount: string | number; [key: string]: any }) => ({
        ...p,
        share_amount: Number(p.share_amount),
      })),
    }))

    return NextResponse.json(formattedExpenses)
  } catch (error) {
    console.error("Error fetching shared expenses:", error)
    return NextResponse.json({ error: "Failed to fetch shared expenses" }, { status: 500 })
  }
}
