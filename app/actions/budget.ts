"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function setBudget(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const amountString = (formData.get("amount") as string)
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const amount = Number.parseFloat(amountString);

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  await sql`
    INSERT INTO budgets (user_id, amount, month, year)
    VALUES (${userId}, ${amount}, ${currentMonth}, ${currentYear})
    ON CONFLICT (user_id, month, year)
    DO UPDATE SET amount = ${amount}, updated_at = CURRENT_TIMESTAMP
  `

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/budget")
}
