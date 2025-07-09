import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUserInDatabase } from '@/lib/user-management';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUserInDatabase();
    
    const settlementId = parseInt(params.id);
    const { status, amount } = await request.json();

    // Validate status
    if (!['paid', 'confirmed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get the current user's DB ID
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const currentUserId = userResult[0].id;

    // Get settlement details to validate ownership
    const settlement = await sql`
      SELECT * FROM shared_expense_settlements 
      WHERE id = ${settlementId}
    `;

    if (settlement.length === 0) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });
    }

    const settlementData = settlement[0];

    // Check if user is authorized to update this settlement
    // User can mark as paid if they are the debtor, or confirm payment if they are the creditor
    if (status === 'paid' && settlementData.debtor_id !== currentUserId) {
      return NextResponse.json({ error: 'Only the debtor can mark a payment as paid' }, { status: 403 });
    }
    
    if (status === 'confirmed' && settlementData.creditor_id !== currentUserId) {
      return NextResponse.json({ error: 'Only the creditor can confirm a payment' }, { status: 403 });
    }

    // Update the settlement
    const updatedSettlement = await sql`
      UPDATE shared_expense_settlements 
      SET 
        status = ${status},
        paid_amount = COALESCE(paid_amount, 0) + ${amount || 0},
        updated_at = NOW()
      WHERE id = ${settlementId}
      RETURNING *
    `;

    return NextResponse.json({ 
      settlement: updatedSettlement[0],
      message: `Payment ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating settlement:', error);
    return NextResponse.json({ error: 'Failed to update settlement' }, { status: 500 });
  }
}
