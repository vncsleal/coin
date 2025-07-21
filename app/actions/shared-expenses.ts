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

export async function getSharedPainelStats() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const stats = await sql`
      WITH user_expenses AS (
        SELECT
          se.total_amount,
          se.paid_by_user_id,
          se.shared_with_user_id,
          se.status
        FROM shared_expenses se
        WHERE se.paid_by_user_id = ${userId} OR se.shared_with_user_id = ${userId}
      )
      SELECT
        COALESCE(SUM(total_amount), 0) AS "totalSpent",
        COALESCE(SUM(CASE WHEN paid_by_user_id = ${userId} THEN total_amount ELSE 0 END), 0) AS "totalPaidByMe",
        COALESCE(SUM(total_amount / 2), 0) AS "myDuePortion",
        COALESCE(SUM(CASE WHEN status = 'unsettled' AND paid_by_user_id = ${userId} THEN total_amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN status = 'unsettled' THEN total_amount / 2 ELSE 0 END), 0) AS "balance"
      FROM user_expenses;
    `;

  return stats[0] as {
    totalSpent: number;
    totalPaidByMe: number;
    myDuePortion: number;
    balance: number;
  }
}

export async function getSharedExpenses() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const sharedExpenses = await sql`
      SELECT
        se.id,
        se.description,
        se.total_amount,
        se.date,
        COALESCE(se.category, '') as category,
        se.paid_by_user_id,
        se.shared_with_user_id,
        se.status,
        pbu.display_name as paid_by_user_name,
        swu.display_name as shared_with_user_name
      FROM shared_expenses se
      JOIN users pbu ON pbu.id = se.paid_by_user_id
      JOIN users swu ON swu.id = se.shared_with_user_id
      WHERE se.paid_by_user_id = ${userId} OR se.shared_with_user_id = ${userId}
      ORDER BY se.date DESC
    `;

  return sharedExpenses as {
    id: string;
    description: string;
    total_amount: number;
    date: string;
    category: string;
    paid_by_user_id: string;
    shared_with_user_id: string;
    status: "unsettled" | "settled";
    paid_by_user_name: string;
    shared_with_user_name: string;
  }[]
}

export async function getMonthlySharedExpensesChartData() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const chartData = await sql`
    SELECT
      TO_CHAR(date, 'YYYY-MM') as month,
      SUM(total_amount / 2) as total
    FROM shared_expenses
    WHERE paid_by_user_id = ${userId} OR shared_with_user_id = ${userId}
    GROUP BY month
    ORDER BY month;
  `;

  return chartData as {
    month: string;
    total: number;
  }[];
}

export async function getSharedExpensesByCategoryData() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const categoryData = await sql`
    WITH
      user_involved_expenses AS (
        SELECT
          category,
          total_amount,
          CASE
            WHEN paid_by_user_id = ${userId} THEN total_amount / 2
            WHEN shared_with_user_id = ${userId} THEN total_amount / 2
            ELSE 0
          END AS my_share_amount
        FROM shared_expenses
        WHERE paid_by_user_id = ${userId} OR shared_with_user_id = ${userId}
      ),
      category_aggregated_data AS (
        SELECT
          COALESCE(category, 'Outros') as category,
          SUM(total_amount) as total_shared_amount_for_category,
          SUM(my_share_amount) as my_share_amount_for_category
        FROM user_involved_expenses
        GROUP BY category
      ),
      overall_my_share_total AS (
        SELECT
          SUM(my_share_amount) as overall_total_my_share
        FROM user_involved_expenses
      )
    SELECT
      cad.category,
      cad.total_shared_amount_for_category as total,
      (cad.my_share_amount_for_category / omt.overall_total_my_share) * 100 as percentage
    FROM category_aggregated_data cad, overall_my_share_total omt
    ORDER BY total DESC;
  `;

  return categoryData.map(item => ({
    category: item.category,
    total: Number(item.total),
    percentage: Number(item.percentage),
  })) as {
    category: string;
    total: number;
    percentage: number;
  }[];
}

export async function updateSharedExpenseStatus(id: string, status: "unsettled" | "settled") {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql`
    UPDATE shared_expenses
    SET status = ${status}
    WHERE id = ${id} AND (paid_by_user_id = ${userId} OR shared_with_user_id = ${userId})
  `

  revalidatePath("/dashboard/shared-expenses")
  revalidatePath("/dashboard")
}

export async function batchSettleSharedExpenses(ids: string[]) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const result = await sql`
    UPDATE shared_expenses
    SET status = 'settled'
    WHERE id = ANY(${ids}) AND (paid_by_user_id = ${userId} OR shared_with_user_id = ${userId})
    RETURNING id
  `

  revalidatePath("/dashboard/shared-expenses")
  revalidatePath("/dashboard")
  
  return result.length
}
