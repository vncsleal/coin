import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUserInDatabase } from '@/lib/user-management';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    // Ensure current user is in database
    await ensureUserInDatabase();
    // Get users from the users table and check friendship status
    const result = await sql`
      SELECT 
        u.id,
        u.email,
        u.display_name,
        u.avatar_url,
        u.bio,
        CASE 
          WHEN f.status IS NOT NULL THEN f.status
          ELSE 'none'
        END as friendship_status
      FROM users u
      LEFT JOIN friends f ON (
        (f.user_id = ${userId} AND f.friend_user_id = u.id) OR
        (f.friend_user_id = ${userId} AND f.user_id = u.id)
      )
      WHERE u.id != ${userId}
        AND (
          u.email ILIKE ${`%${search}%`} OR 
          u.display_name ILIKE ${`%${search}%`}
        )
      ORDER BY 
        CASE WHEN f.status = 'accepted' THEN 0 ELSE 1 END,
        u.display_name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json({
      users: result || [],
      pagination: {
        page,
        limit,
        hasMore: (result?.length || 0) === limit
      }
    });
  } catch (error) {
    console.error('Error browsing users:', error);
    return NextResponse.json({ 
      error: 'Failed to browse users',
      users: [],
      pagination: {
        page,
        limit,
        hasMore: false
      }
    }, { status: 500 });
  }
}
