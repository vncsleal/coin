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

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { description, total_amount, date, category, shared_with_user_id } = await request.json();

  if (!description || !total_amount || !date || !shared_with_user_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    // Insert the new shared expense
    const result = await sql`
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
        ${category || null},
        ${userId},
        ${shared_with_user_id}
      )
      RETURNING id;
    `;

    return NextResponse.json({ message: 'Shared expense created successfully', id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error('Error creating shared expense:', error);
    return NextResponse.json({ error: 'Failed to create shared expense' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, description, total_amount, date, category, shared_with_user_id } = await request.json();

  if (!id || !description || !total_amount || !date || !shared_with_user_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const result = await sql`
      UPDATE shared_expenses
      SET
        description = ${description},
        total_amount = ${total_amount},
        date = ${date},
        category = ${category || null},
        shared_with_user_id = ${shared_with_user_id}
      WHERE id = ${id} AND paid_by_user_id = ${userId}
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Shared expense not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Shared expense updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating shared expense:', error);
    return NextResponse.json({ error: 'Failed to update shared expense' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Shared expense ID is required' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const result = await sql`
      DELETE FROM shared_expenses
      WHERE id = ${id} AND paid_by_user_id = ${userId}
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Shared expense not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Shared expense deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting shared expense:', error);
    return NextResponse.json({ error: 'Failed to delete shared expense' }, { status: 500 });
  }
}
