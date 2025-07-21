"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { addExpenseSchema, updateExpenseSchema, deleteExpenseSchema } from "@/lib/schemas";

export async function addExpense(formData: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = addExpenseSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    tag: formData.get("tag"),
    date: formData.get("date"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  const { name, amount: amountString, tag, date } = validatedFields.data;
  const amount = Number.parseFloat(amountString.replace(",", "."));

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

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = updateExpenseSchema.safeParse({
    id,
    name: formData.get("name"),
    amount: formData.get("amount"),
    tag: formData.get("tag"),
    date: formData.get("date"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  const { name, amount: amountString, tag, date } = validatedFields.data;
  const amount = Number.parseFloat(amountString.replace(",", "."));

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

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = deleteExpenseSchema.safeParse({ id });

  if (!validatedFields.success) {
    throw new Error("Invalid ID");
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