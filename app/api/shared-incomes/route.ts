import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const sharedIncomes = (await sql`
      SELECT
        si.id,
        si.description,
        si.total_amount,
        si.date,
        si.category,
        si.received_by_user_id,
        si.shared_with_user_id,
        si.status,
        u_received.display_name as received_by_user_name,
        u_shared.display_name as shared_with_user_name
      FROM shared_incomes si
      JOIN users u_received ON si.received_by_user_id = u_received.id
      JOIN users u_shared ON si.shared_with_user_id = u_shared.id
      WHERE si.received_by_user_id = ${userId} OR si.shared_with_user_id = ${userId}
      ORDER BY si.date DESC, si.created_at DESC;
    `).map(income => ({
      ...income,
      total_amount: Number(income.total_amount),
    }));

    return NextResponse.json({ sharedIncomes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shared incomes:', error);
    return NextResponse.json({ error: 'Failed to fetch shared incomes' }, { status: 500 });
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

    const result = await sql`
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
        ${category || null},
        ${userId},
        ${shared_with_user_id}
      )
      RETURNING id;
    `;

    return NextResponse.json({ message: 'Shared income created successfully', id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error('Error creating shared income:', error);
    return NextResponse.json({ error: 'Failed to create shared income' }, { status: 500 });
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
      UPDATE shared_incomes
      SET
        description = ${description},
        total_amount = ${total_amount},
        date = ${date},
        category = ${category || null},
        shared_with_user_id = ${shared_with_user_id}
      WHERE id = ${id} AND received_by_user_id = ${userId}
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Shared income not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Shared income updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating shared income:', error);
    return NextResponse.json({ error: 'Failed to update shared income' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const result = await sql`
      UPDATE shared_incomes
      SET status = ${status}
      WHERE id = ${id} AND (received_by_user_id = ${userId} OR shared_with_user_id = ${userId})
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Shared income not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Shared income status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating shared income status:', error);
    return NextResponse.json({ error: 'Failed to update shared income status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'Shared income ID is required' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const result = await sql`
      DELETE FROM shared_incomes
      WHERE id = ${id} AND received_by_user_id = ${userId}
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Shared income not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Shared income deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting shared income:', error);
    return NextResponse.json({ error: 'Failed to delete shared income' }, { status: 500 });
  }
}
