import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUserInDatabase } from '@/lib/user-management';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUserInDatabase();
    
    const { expenseIds, action } = await request.json();

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return NextResponse.json({ error: 'Invalid expense IDs' }, { status: 400 });
    }

    // Get the current user's DB ID
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const currentUserId = userResult[0].id;

    switch (action) {
      case 'settle':
        // Mark all settlements as paid for the current user
        await sql`
          UPDATE shared_expense_settlements
          SET status = 'paid', paid_amount = amount, updated_at = NOW()
          WHERE shared_expense_id = ANY(${expenseIds})
            AND debtor_id = ${currentUserId}
            AND status = 'pending'
        `;
        break;

      case 'remind':
        // Send reminders for all pending settlements where user is creditor
        const reminders = await sql`
          UPDATE shared_expense_settlements
          SET 
            last_reminder_sent = NOW(),
            reminder_count = COALESCE(reminder_count, 0) + 1,
            updated_at = NOW()
          WHERE shared_expense_id = ANY(${expenseIds})
            AND creditor_id = ${currentUserId}
            AND status != 'confirmed'
          RETURNING id, debtor_id, amount
        `;
        
        // In a real app, you would send actual reminders here
        console.log(`Sent ${reminders.length} bulk reminders`);
        break;

      case 'mark_settled':
        // Mark all settlements as confirmed for expenses where user is creditor
        await sql`
          UPDATE shared_expense_settlements
          SET status = 'confirmed', updated_at = NOW()
          WHERE shared_expense_id = ANY(${expenseIds})
            AND creditor_id = ${currentUserId}
            AND status = 'paid'
        `;
        break;

      case 'delete':
        // Delete expenses created by the current user
        const deletedExpenses = await sql`
          DELETE FROM shared_expenses
          WHERE id = ANY(${expenseIds})
            AND created_by = ${userId}
          RETURNING id
        `;
        
        if (deletedExpenses.length !== expenseIds.length) {
          return NextResponse.json({ 
            error: 'Some expenses could not be deleted (not owner or not found)',
            deletedCount: deletedExpenses.length 
          }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Bulk ${action} completed successfully`,
      processedCount: expenseIds.length
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json({ error: 'Failed to perform bulk operation' }, { status: 500 });
  }
}
