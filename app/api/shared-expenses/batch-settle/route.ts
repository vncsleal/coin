import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids } = await request.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Missing or invalid IDs' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const result = await sql`
      UPDATE shared_expenses
      SET status = 'settled'
      WHERE id = ANY(${ids}) AND (paid_by_user_id = ${userId} OR shared_with_user_id = ${userId})
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ message: 'No shared expenses found or updated' }, { status: 200 });
    }

    return NextResponse.json({ message: `${result.length} shared expenses marked as settled` }, { status: 200 });
  } catch (error) {
    console.error('Error batch settling shared expenses:', error);
    return NextResponse.json({ error: 'Failed to batch settle shared expenses' }, { status: 500 });
  }
}
