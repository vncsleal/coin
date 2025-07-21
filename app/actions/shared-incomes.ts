"use server"

import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { addSharedIncomeSchema, updateSharedIncomeSchema, deleteSharedIncomeSchema } from "@/lib/schemas";

export async function addSharedIncome(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = addSharedIncomeSchema.safeParse({
    description: formData.get("description"),
    total_amount: formData.get("total_amount"),
    date: formData.get("date"),
    category: formData.get("category"),
    shared_with_user_id: formData.get("shared_with_user_id"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  const { description, total_amount: totalAmountString, date, category, shared_with_user_id } = validatedFields.data;
  const total_amount = Number.parseFloat(totalAmountString.replace(",", "."));

  await sql`
    INSERT INTO shared_incomes (
      description,
      total_amount,
      date,
      category,
      received_by_user_id,
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

  revalidatePath("/dashboard/shared-incomes")
  revalidatePath("/dashboard")
}

export async function updateSharedIncome(id: string, formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = updateSharedIncomeSchema.safeParse({
    id,
    description: formData.get("description"),
    total_amount: formData.get("total_amount"),
    date: formData.get("date"),
    category: formData.get("category"),
    shared_with_user_id: formData.get("shared_with_user_id"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  const { description, total_amount: totalAmountString, date, category, shared_with_user_id } = validatedFields.data;
  const total_amount = Number.parseFloat(totalAmountString.replace(",", "."));

  await sql`
    UPDATE shared_incomes
    SET
      description = ${description},
      total_amount = ${total_amount},
      date = ${date},
      category = ${category},
      shared_with_user_id = ${shared_with_user_id}
    WHERE id = ${id} AND received_by_user_id = ${userId}
  `

  revalidatePath("/dashboard/shared-incomes")
  revalidatePath("/dashboard")
}

export async function deleteSharedIncome(id: string) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  const validatedFields = deleteSharedIncomeSchema.safeParse({ id });

  if (!validatedFields.success) {
    throw new Error("Invalid ID");
  }

  await sql`
    DELETE FROM shared_incomes
    WHERE id = ${id} AND received_by_user_id = ${userId}
  `

  revalidatePath("/dashboard/shared-incomes")
  revalidatePath("/dashboard")
}

export async function getSharedIncomes() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const sharedIncomes = await sql`
      SELECT
        si.id,
        si.description,
        si.total_amount,
        si.date,
        COALESCE(si.category, '') as category,
        si.received_by_user_id,
        si.shared_with_user_id,
        si.status,
        rbu.display_name as received_by_user_name,
        swu.display_name as shared_with_user_name
      FROM shared_incomes si
      JOIN users rbu ON rbu.id = si.received_by_user_id
      JOIN users swu ON swu.id = si.shared_with_user_id
      WHERE si.received_by_user_id = ${userId} OR si.shared_with_user_id = ${userId}
      ORDER BY si.date DESC
    `;

  return sharedIncomes as {
    id: string;
    description: string;
    total_amount: number;
    date: string;
    category: string;
    received_by_user_id: string;
    shared_with_user_id: string;
    status: "unsettled" | "settled";
    received_by_user_name: string;
    shared_with_user_name: string;
  }[]
}

export async function getMonthlySharedIncomesChartData() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const chartData = await sql`
    SELECT
      TO_CHAR(date, 'YYYY-MM') as month,
      SUM(total_amount / 2) as total
    FROM shared_incomes
    WHERE received_by_user_id = ${userId} OR shared_with_user_id = ${userId}
    GROUP BY month
    ORDER BY month;
  `;

  return chartData as {
    month: string;
    total: number;
  }[];
}

export async function getSharedIncomesByCategoryData() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const categoryData = await sql`
    WITH
      user_involved_incomes AS (
        SELECT
          category,
          total_amount,
          CASE
            WHEN received_by_user_id = ${userId} THEN total_amount / 2
            WHEN shared_with_user_id = ${userId} THEN total_amount / 2
            ELSE 0
          END AS my_share_amount
        FROM shared_incomes
        WHERE received_by_user_id = ${userId} OR shared_with_user_id = ${userId}
      ),
      category_aggregated_data AS (
        SELECT
          COALESCE(category, 'Outros') as category,
          SUM(total_amount) as total_shared_amount_for_category,
          SUM(my_share_amount) as my_share_amount_for_category
        FROM user_involved_incomes
        GROUP BY category
      ),
      overall_my_share_total AS (
        SELECT
          SUM(my_share_amount) as overall_total_my_share
        FROM user_involved_incomes
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

export async function getSharedPainelStats() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const stats = await sql`
      WITH user_incomes AS (
        SELECT
          si.total_amount,
          si.received_by_user_id,
          si.shared_with_user_id
        FROM shared_incomes si
        WHERE si.received_by_user_id = ${userId} OR si.shared_with_user_id = ${userId}
      )
      SELECT
        COALESCE(SUM(total_amount), 0) AS "totalJointSavings",
        COALESCE(SUM(CASE WHEN received_by_user_id = ${userId} THEN total_amount ELSE 0 END), 0) AS "myTotalContribution",
        COALESCE(SUM(CASE WHEN shared_with_user_id = ${userId} THEN total_amount ELSE 0 END), 0) AS "friendTotalContribution"
      FROM user_incomes;
    `;

  return stats[0] as {
    totalJointSavings: number;
    myTotalContribution: number;
    friendTotalContribution: number;
  }
}

export async function updateSharedIncomeStatus(id: string, status: "unsettled" | "settled") {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  await sql`
    UPDATE shared_incomes
    SET status = ${status}
    WHERE id = ${id} AND (received_by_user_id = ${userId} OR shared_with_user_id = ${userId})
  `

  revalidatePath("/dashboard/shared-incomes")
  revalidatePath("/dashboard")
}

export async function batchSettleSharedIncomes(ids: string[]) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Unauthorized")
  }

  const result = await sql`
    UPDATE shared_incomes
    SET status = 'settled'
    WHERE id = ANY(${ids}) AND (received_by_user_id = ${userId} OR shared_with_user_id = ${userId})
    RETURNING id
  `

  revalidatePath("/dashboard/shared-incomes")
  revalidatePath("/dashboard")
  
  return result.length
}
