"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addExpense(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const amount = Number.parseFloat((formData.get("amount") as string).replace(',', '.'))
  const tag = formData.get("tag") as string
  const date = formData.get("date") as string

  if (!name || !amount || !tag || !date) {
    throw new Error("Missing required fields")
  }

  await sql`
    INSERT INTO expenses (user_id, name, amount, tag, date)
    VALUES (${userId}, ${name}, ${amount}, ${tag}, ${date})
  `

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/expenses")
}

export async function updateExpense(id: number, formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const amount = Number.parseFloat((formData.get("amount") as string).replace(',', '.'))
  const tag = formData.get("tag") as string
  const date = formData.get("date") as string

  if (!name || !amount || !tag || !date) {
    throw new Error("Missing required fields")
  }

  await sql`
    UPDATE expenses
    SET name = ${name}, amount = ${amount}, tag = ${tag}, date = ${date}
    WHERE id = ${id} AND user_id = ${userId}
  `

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/expenses")
}

export async function deleteExpense(id: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql`
    DELETE FROM expenses 
    WHERE id = ${id} AND user_id = ${userId}
  `

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/expenses")
}

export async function getExpenses() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const expenses = await sql`
    SELECT * FROM expenses 
    WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC
  `

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  }))
}