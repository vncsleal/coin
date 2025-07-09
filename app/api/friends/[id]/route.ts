import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action } = await request.json();
    const friendshipId = parseInt(params.id);

    // Verify the user is part of this friendship
    const friendship = await sql`
      SELECT * FROM friends 
      WHERE id = ${friendshipId} 
        AND (user_id = ${userId} OR friend_user_id = ${userId})
    `;

    if (friendship.length === 0) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    let result;

    switch (action) {
      case 'accept':
        result = await sql`
          UPDATE friends 
          SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${friendshipId}
          RETURNING *
        `;
        break;

      case 'decline':
        result = await sql`
          UPDATE friends 
          SET status = 'declined', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${friendshipId}
          RETURNING *
        `;
        break;

      case 'remove':
        // For remove, we delete the friendship
        result = await sql`
          DELETE FROM friends 
          WHERE id = ${friendshipId}
          RETURNING *
        `;
        break;

      case 'block':
        result = await sql`
          UPDATE friends 
          SET status = 'blocked', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${friendshipId}
          RETURNING *
        `;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      friendship: result[0] 
    });
    
  } catch (error) {
    console.error('Error updating friendship:', error);
    return NextResponse.json({ error: 'Failed to update friendship' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const friendshipId = parseInt(params.id);

    const result = await sql`
      DELETE FROM friends 
      WHERE id = ${friendshipId} 
        AND (user_id = ${userId} OR friend_user_id = ${userId})
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting friendship:', error);
    return NextResponse.json({ error: 'Failed to delete friendship' }, { status: 500 });
  }
}
