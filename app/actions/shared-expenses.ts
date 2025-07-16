"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addSharedExpense(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const description = formData.get("description") as string
  const total_amount = Number.parseFloat(formData.get("total_amount") as string)
  const date = formData.get("date") as string
  const category = formData.get("category") as string | null
  const shared_with_user_id = formData.get("shared_with_user_id") as string

  if (!description || !total_amount || !date || !shared_with_user_id) {
    throw new Error("Missing required fields")
  }

  await sql`
    INSERT INTO shared_expenses (
      description,
      total_amount,
      date,
      category,
      paid_by_user_id,
      shared_with_user_id
    )
    VALUES (
      ${description},
      ${total_amount},
      ${date},
      ${category},
      ${userId},
      ${shared_with_user_id}
    )
  `

  revalidatePath("/dashboard/shared-expenses")
  revalidatePath("/dashboard")
}

export async function updateSharedExpense(id: string, formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const description = formData.get("description") as string
  const total_amount = Number.parseFloat(formData.get("total_amount") as string)
  const date = formData.get("date") as string
  const category = formData.get("category") as string | null
  const shared_with_user_id = formData.get("shared_with_user_id") as string

  if (!description || !total_amount || !date || !shared_with_user_id) {
    throw new Error("Missing required fields")
  }

  await sql`
    UPDATE shared_expenses
    SET
      description = ${description},
      total_amount = ${total_amount},
      date = ${date},
      category = ${category},
      shared_with_user_id = ${shared_with_user_id}
    WHERE id = ${id} AND paid_by_user_id = ${userId}
  `

  revalidatePath("/dashboard/shared-expenses")
  revalidatePath("/dashboard")
}

export async function deleteSharedExpense(id: string) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql`
    DELETE FROM shared_expenses
    WHERE id = ${id} AND paid_by_user_id = ${userId}
  `

  revalidatePath("/dashboard/shared-expenses")
  revalidatePath("/dashboard")
}
