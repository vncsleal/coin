import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const expenses = await sql`
      SELECT * FROM expenses 
      WHERE user_id = ${userId}
      ORDER BY date DESC, created_at DESC
    `

    const formattedExpenses = expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    }))

    return NextResponse.json(formattedExpenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}
