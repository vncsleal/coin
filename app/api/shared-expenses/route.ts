import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { ensureUserInDatabase } from "@/lib/user-management"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`)

  try {
    await ensureUserInDatabase()

    const sharedExpenses = await sql`
      SELECT 
        se.*,
        json_agg(
          json_build_object(
            'id', sep.id,
            'user_id', sep.user_id,
            'share_amount', sep.share_amount,
            'settlement_status', CASE 
              WHEN ses_debtor.status IS NOT NULL THEN ses_debtor.status
              WHEN ses_creditor.status IS NOT NULL THEN ses_creditor.status
              ELSE 'pending'
            END,
            'paid_amount', COALESCE(ses_debtor.paid_amount, ses_creditor.paid_amount, 0)
          )
        ) as participants
      FROM shared_expenses se
      JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
      LEFT JOIN shared_expense_settlements ses_debtor ON se.id = ses_debtor.shared_expense_id AND sep.user_id = ses_debtor.debtor_id
      LEFT JOIN shared_expense_settlements ses_creditor ON se.id = ses_creditor.shared_expense_id AND sep.user_id = ses_creditor.creditor_id
      WHERE sep.user_id = ${userId}
      GROUP BY se.id
      ORDER BY se.created_at DESC
    `

    const formattedExpenses = sharedExpenses.map((expense) => ({
      ...expense,
      total_amount: Number(expense.total_amount),
      participants: expense.participants.map((p: any) => ({
        ...p,
        share_amount: Number(p.share_amount),
        paid_amount: Number(p.paid_amount || 0),
      })),
    }))

    return NextResponse.json(formattedExpenses)
  } catch (error) {
    console.error("Error fetching shared expenses:", error)
    return NextResponse.json({ error: "Failed to fetch shared expenses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`)

  try {
    await ensureUserInDatabase()
    
    const body = await request.json()
    const { name, totalAmount, date, tag, participants, splitMethod, items } = body

    // Validate required fields
    if (!name || !totalAmount || !date || !tag || !participants?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the shared expense
    const expense = await sql`
      INSERT INTO shared_expenses (name, total_amount, date, tag, created_by, split_method, items)
      VALUES (${name}, ${totalAmount}, ${date}, ${tag}, ${userId}, ${splitMethod || 'equal'}, ${JSON.stringify(items || [])})
      RETURNING *
    `

    const expenseId = expense[0].id

    // Get the current user's DB ID (who created the expense and initially paid)
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const creatorUserId = userResult[0].id;

    // Add participants and create settlements
    for (const participant of participants) {
      await sql`
        INSERT INTO shared_expense_participants (shared_expense_id, user_id, share_amount)
        VALUES (${expenseId}, ${participant.user_id}, ${participant.share_amount})
      `

      // Create settlement record only if participant owes money to the creator
      if (participant.user_id !== creatorUserId && participant.share_amount > 0) {
        await sql`
          INSERT INTO shared_expense_settlements (
            shared_expense_id, 
            debtor_id, 
            creditor_id, 
            amount, 
            status
          )
          VALUES (${expenseId}, ${participant.user_id}, ${creatorUserId}, ${participant.share_amount}, 'pending')
        `
      }
    }

    return NextResponse.json({ success: true, expense: expense[0] })
  } catch (error) {
    console.error("Error creating shared expense:", error)
    return NextResponse.json({ error: "Failed to create shared expense" }, { status: 500 })
  }
}
