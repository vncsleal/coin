import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's financial data
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Get current month expenses
    const monthlyExpenses = await sql`
      SELECT tag, SUM(amount) as amount
      FROM expenses 
      WHERE user_id = ${userId}
      AND EXTRACT(MONTH FROM date) = ${currentMonth}
      AND EXTRACT(YEAR FROM date) = ${currentYear}
      GROUP BY tag
      ORDER BY amount DESC
    `

    // Get total monthly spending
    const totalSpending = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses 
      WHERE user_id = ${userId}
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

    // Get last 3 months spending for trend analysis
    const historicalSpending = await sql`
      SELECT 
        EXTRACT(MONTH FROM date) as month,
        EXTRACT(YEAR FROM date) as year,
        SUM(amount) as total
      FROM expenses 
      WHERE user_id = ${userId}
      AND date >= CURRENT_DATE - INTERVAL '3 months'
      GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
      ORDER BY year DESC, month DESC
    `

    const financialData = {
      monthlyExpenses: monthlyExpenses.map((row) => ({
        category: row.tag,
        amount: Number(row.amount),
      })),
      totalSpending: Number(totalSpending[0]?.total || 0),
      budget: Number(budget[0]?.amount || 0),
      historicalSpending: historicalSpending.map((row) => ({
        month: row.month,
        year: row.year,
        total: Number(row.total),
      })),
    }

    const prompt = `
    As a financial advisor, analyze the following user's financial data and provide personalized advice:

    Current Month Spending: $${financialData.totalSpending}
    Monthly Budget: $${financialData.budget}
    Budget Remaining: $${financialData.budget - financialData.totalSpending}

    Spending by Category:
    ${financialData.monthlyExpenses.map((exp) => `- ${exp.category}: $${exp.amount}`).join("\n")}

    Historical Spending (last 3 months):
    ${financialData.historicalSpending.map((hist) => `- ${hist.month}/${hist.year}: $${hist.total}`).join("\n")}

    Please provide:
    1. Analysis of spending patterns
    2. Budget adherence assessment
    3. Areas where they're succeeding
    4. Areas that need improvement
    5. Specific actionable recommendations
    6. Tips for better financial management

    Keep the response conversational, encouraging, and practical. Focus on actionable advice.
    `

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 1000,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("AI Counseling error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
