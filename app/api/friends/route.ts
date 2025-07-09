import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUserInDatabase } from '@/lib/user-management';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure current user is in database
    await ensureUserInDatabase();

    const result = await sql`
      SELECT 
        f.*,
        CASE 
          WHEN f.user_id = ${userId} THEN u2.email
          ELSE u1.email
        END as friend_email,
        CASE 
          WHEN f.user_id = ${userId} THEN u2.display_name
          ELSE u1.display_name
        END as friend_name,
        CASE 
          WHEN f.user_id = ${userId} THEN u2.avatar_url
          ELSE u1.avatar_url
        END as friend_avatar,
        CASE 
          WHEN f.user_id = ${userId} THEN u2.id
          ELSE u1.id
        END as friend_id
      FROM friends f
      JOIN users u1 ON f.user_id = u1.id
      JOIN users u2 ON f.friend_user_id = u2.id
      WHERE f.user_id = ${userId} OR f.friend_user_id = ${userId}
      ORDER BY f.updated_at DESC
    `;

    return NextResponse.json({ friends: result || [] });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch friends',
      friends: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure current user is in database
    await ensureUserInDatabase();
    
    const { friendUserId } = await request.json();

    if (userId === friendUserId) {
      return NextResponse.json({ error: 'Cannot add yourself as a friend' }, { status: 400 });
    }

    // Check if friend user exists in our database
    const friendExists = await sql`
      SELECT id FROM users WHERE id = ${friendUserId}
    `;

    if (friendExists.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if friendship already exists
    const existing = await sql`
      SELECT * FROM friends 
      WHERE (user_id = ${userId} AND friend_user_id = ${friendUserId})
         OR (user_id = ${friendUserId} AND friend_user_id = ${userId})
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO friends (user_id, friend_user_id, initiated_by, status)
      VALUES (${userId}, ${friendUserId}, ${userId}, 'pending')
      RETURNING *
    `;

    return NextResponse.json({ friend: result[0] });
  } catch (error) {
    console.error('Error creating friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
