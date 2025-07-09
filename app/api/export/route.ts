import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const format = formData.get("format") as string

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 })
  }

  const expenses = await sql`
    SELECT name, tag, amount, date, created_at
    FROM expenses 
    WHERE user_id = ${userId}
    AND date >= ${startDate}
    AND date <= ${endDate}
    ORDER BY date DESC
  `

  if (format === "json") {
    return NextResponse.json(expenses)
  }

  // CSV format
  const csvHeader = "Name,Category,Amount,Date,Created At\n"
  const csvRows = expenses
    .map((expense) => `"${expense.name}","${expense.tag}",${expense.amount},"${expense.date}","${expense.created_at}"`)
    .join("\n")

  const csvContent = csvHeader + csvRows

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="expenses.csv"',
    },
  })
}
