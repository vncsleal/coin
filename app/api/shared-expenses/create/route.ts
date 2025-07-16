import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

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
