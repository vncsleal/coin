"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Income } from "@/lib/types"

import { addIncomeSchema, updateIncomeSchema, deleteIncomeSchema } from "@/lib/schemas";

export async function addIncome(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = addIncomeSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  const { name, amount: amountString, date } = validatedFields.data;
  const amount = Number.parseFloat(amountString);

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

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = updateIncomeSchema.safeParse({
    id,
    name: formData.get("name"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  const { name, amount: amountString, date } = validatedFields.data;
  const amount = Number.parseFloat(amountString);

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

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = deleteIncomeSchema.safeParse({ id });

  if (!validatedFields.success) {
    throw new Error("Invalid ID");
  }

  await sql`
    DELETE FROM incomes
    WHERE id = ${id} AND user_id = ${userId}
  `

  revalidatePath("/dashboard/income")
  revalidatePath("/dashboard")
}

export async function getIncomes(): Promise<Income[]> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const incomes = await sql`
    SELECT id, user_id, name, amount, date, created_at, updated_at
    FROM incomes
    WHERE user_id = ${userId}
    ORDER BY date DESC
  `

  return incomes.map((income) => ({
    id: income.id as number,
    user_id: income.user_id as string,
    name: income.name as string,
    amount: Number(income.amount),
    date: income.date as string,
    created_at: income.created_at as string,
    updated_at: income.updated_at as string,
  }))
}
