import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const incomes = await sql`
      SELECT id, name, amount, date
      FROM incomes
      WHERE user_id = ${userId}
      ORDER BY date DESC
    `
    return NextResponse.json({ incomes })
  } catch (error) {
    console.error("Failed to fetch incomes:", error)
    return NextResponse.json({ error: "Failed to fetch incomes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, amount, date } = await request.json()

    if (!name || !amount || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newIncome] = await sql`
      INSERT INTO incomes (user_id, name, amount, date)
      VALUES (${userId}, ${name}, ${amount}, ${date})
      RETURNING id, name, amount, date
    `

    return NextResponse.json({ income: newIncome }, { status: 201 })
  } catch (error) {
    console.error("Failed to create income:", error)
    return NextResponse.json({ error: "Failed to create income" }, { status: 500 })
  }
}
