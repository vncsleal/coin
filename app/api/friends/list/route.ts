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

    // Fetch accepted friends
    const friendsResult = await sql`
      SELECT
        id,
        CASE
          WHEN user_id = ${userId} THEN friend_user_id
          ELSE user_id
        END as friend_id,
        CASE
          WHEN user_id = ${userId} THEN (SELECT display_name FROM users WHERE id = friend_user_id)
          ELSE (SELECT display_name FROM users WHERE id = user_id)
        END as display_name,
        CASE
          WHEN user_id = ${userId} THEN (SELECT avatar_url FROM users WHERE id = friend_user_id)
          ELSE (SELECT avatar_url FROM users WHERE id = user_id)
        END as avatar_url,
        CASE
          WHEN user_id = ${userId} THEN (SELECT email FROM users WHERE id = friend_user_id)
          ELSE (SELECT email FROM users WHERE id = user_id)
        END as email,
        status
      FROM friends
      WHERE (user_id = ${userId} OR friend_user_id = ${userId}) AND status = 'accepted';
    `;

    // Fetch pending requests where current user is the receiver
    const receivedRequestsResult = await sql`
      SELECT
        id,
        user_id as sender_id,
        (SELECT display_name FROM users WHERE id = user_id) as sender_name,
        status
      FROM friends
      WHERE friend_user_id = ${userId} AND status = 'pending';
    `;

    const friends = friendsResult.map(row => ({ id: row.friend_id, display_name: row.display_name, email: row.email, avatar_url: row.avatar_url }));
    const pendingRequests = receivedRequestsResult.map(row => ({
      id: row.id,
      sender_id: row.sender_id,
      sender_name: row.sender_name,
      status: row.status,
    }));

    return NextResponse.json({
      friends,
      pendingRequests,
    });
  } catch (error) {
    console.error('Error fetching friends and requests:', error);
    return NextResponse.json({ error: 'Failed to fetch friends and requests' }, { status: 500 });
  }
}