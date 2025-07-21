"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addIncome(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const date = formData.get("date") as string

  if (!name || !amount || !date) {
    throw new Error("Missing required fields")
  }

  await sql`
    INSERT INTO incomes (user_id, name, amount, date)
    VALUES (${userId}, ${name}, ${amount}, ${date})
  `

  revalidatePath("/dashboard/income")
  revalidatePath("/dashboard")
}

export async function updateIncome(id: number, formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const date = formData.get("date") as string

  if (!name || !amount || !date) {
    throw new Error("Missing required fields")
  }

  await sql`
    UPDATE incomes
    SET name = ${name}, amount = ${amount}, date = ${date}
    WHERE id = ${id} AND user_id = ${userId}
  `

  revalidatePath("/dashboard/income")
  revalidatePath("/dashboard")
}

export async function deleteIncome(id: number) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql`
    DELETE FROM incomes
    WHERE id = ${id} AND user_id = ${userId}
  `

  revalidatePath("/dashboard/income")
  revalidatePath("/dashboard")
}

export async function getIncomes() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const incomes = await sql`
    SELECT id, name, amount, date
    FROM incomes
    WHERE user_id = ${userId}
    ORDER BY date DESC
  `

  return incomes.map((income) => ({
    ...income,
    amount: Number(income.amount),
  }))
}
