import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const sharedExpenses = (await sql`
      SELECT
        se.id,
        se.description,
        se.total_amount,
        se.date,
        se.category,
        se.paid_by_user_id,
        se.shared_with_user_id,
        se.status,
        u_paid.display_name as paid_by_user_name,
        u_shared.display_name as shared_with_user_name
      FROM shared_expenses se
      JOIN users u_paid ON se.paid_by_user_id = u_paid.id
      JOIN users u_shared ON se.shared_with_user_id = u_shared.id
      WHERE se.paid_by_user_id = ${userId} OR se.shared_with_user_id = ${userId}
      ORDER BY se.date DESC, se.created_at DESC;
    `).map(expense => ({
      ...expense,
      total_amount: Number(expense.total_amount),
    }));

    return NextResponse.json({ sharedExpenses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shared expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch shared expenses' }, { status: 500 });
  }
}
