import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { receiverId } = await request.json();

  if (!receiverId) {
    return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
  }

  if (userId === receiverId) {
    return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    // Check if a friendship or pending request already exists in either direction
    const existingFriendship = await sql`
      SELECT id, status FROM friends
      WHERE (user_id = ${userId} AND friend_user_id = ${receiverId})
         OR (user_id = ${receiverId} AND friend_user_id = ${userId});
    `;

    if (existingFriendship.length > 0) {
      const status = existingFriendship[0].status;
      if (status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 409 });
      } else if (status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 409 });
      }
    }

    // Insert new friend request
    await sql`
      INSERT INTO friends (user_id, friend_user_id, status)
      VALUES (${userId}, ${receiverId}, 'pending');
    `;

    return NextResponse.json({ message: 'Friend request sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
