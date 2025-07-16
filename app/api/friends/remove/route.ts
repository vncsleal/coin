import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { friendId } = await request.json();

  if (!friendId) {
    return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    // Delete the friendship from the friends table
    const result = await sql`
      DELETE FROM friends
      WHERE (user_id = ${userId} AND friend_user_id = ${friendId} AND status = 'accepted')
         OR (user_id = ${friendId} AND friend_user_id = ${userId} AND status = 'accepted')
      RETURNING id;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Friendship not found or not accepted' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Friendship removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error removing friendship:', error);
    return NextResponse.json({ error: 'Failed to remove friendship' }, { status: 500 });
  }
}
