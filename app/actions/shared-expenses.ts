"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createSharedExpense(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const tag = formData.get("tag") as string
  const date = formData.get("date") as string

  if (!name || !amount || !tag || !date) {
    throw new Error("Missing required fields")
  }

  // Get participants from form data
  const participants: string[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("participant_") && value) {
      participants.push(value as string)
    }
  }

  if (participants.length === 0) {
    throw new Error("At least one participant is required")
  }

  // Add the creator as a participant
  participants.push(userId)

  // Create shared expense
  const sharedExpenseResult = await sql`
    INSERT INTO shared_expenses (name, total_amount, date, tag, created_by)
    VALUES (${name}, ${amount}, ${date}, ${tag}, ${userId})
    RETURNING id
  `

  const sharedExpenseId = sharedExpenseResult[0].id
  const shareAmount = amount / participants.length

  // Add participants
  for (const participantId of participants) {
    await sql`
      INSERT INTO shared_expense_participants (shared_expense_id, user_id, share_amount)
      VALUES (${sharedExpenseId}, ${participantId}, ${shareAmount})
    `
  }

  // Add to creator's personal expenses
  await sql`
    INSERT INTO expenses (user_id, name, amount, tag, date)
    VALUES (${userId}, ${name + " (Shared)"}, ${shareAmount}, ${tag}, ${date})
  `

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/shared")
}
