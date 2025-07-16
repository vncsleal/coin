import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`)

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
