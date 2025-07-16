import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { requestId } = await request.json();

  if (!requestId) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    // Delete the friend request
    const result = await sql`
      DELETE FROM friends
      WHERE id = ${requestId} AND friend_user_id = ${userId} AND status = 'pending'
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Friend request not found or not pending for this user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Friend request denied successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error denying friend request:', error);
    return NextResponse.json({ error: 'Failed to deny friend request' }, { status: 500 });
  }
}
