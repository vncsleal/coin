import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUserInDatabase } from '@/lib/user-management';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  try {
    await ensureUserInDatabase();
    
    const { settlementId, message } = await request.json();

    // Get the current user's DB ID
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const currentUserId = userResult[0].id;

    // Get settlement details with participant information
    const settlement = await sql`
      SELECT 
        ses.*,
        debtor.email as debtor_email,
        debtor.display_name as debtor_name,
        creditor.email as creditor_email,
        creditor.display_name as creditor_name,
        se.description as expense_description
      FROM shared_expense_settlements ses
      JOIN users debtor ON ses.debtor_id = debtor.id
      JOIN users creditor ON ses.creditor_id = creditor.id
      JOIN shared_expenses se ON ses.shared_expense_id = se.id
      WHERE ses.id = ${settlementId}
    `;

    if (settlement.length === 0) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });
    }

    const settlementData = settlement[0];

    // Check if user is authorized to send reminder (only creditor can send reminders)
    if (settlementData.creditor_id !== currentUserId) {
      return NextResponse.json({ error: 'Only the creditor can send payment reminders' }, { status: 403 });
    }

    // In a real app, you would integrate with an email service here
    // For now, we'll just log the reminder and return success
    console.log(`Payment reminder sent for settlement ${settlementId}:`);
    console.log(`From: ${settlementData.creditor_name} (${settlementData.creditor_email})`);
    console.log(`To: ${settlementData.debtor_name} (${settlementData.debtor_email})`);
    console.log(`Amount: $${settlementData.amount}`);
    console.log(`Expense: ${settlementData.expense_description}`);
    console.log(`Message: ${message || 'Please settle your share of the expense.'}`);

    // Update the settlement with reminder info
    await sql`
      UPDATE shared_expense_settlements 
      SET 
        last_reminder_sent = NOW(),
        reminder_count = COALESCE(reminder_count, 0) + 1,
        updated_at = NOW()
      WHERE id = ${settlementId}
    `;

    // In a production app, you would:
    // 1. Send an actual email using a service like SendGrid, Resend, or AWS SES
    // 2. Create a notification record in the database
    // 3. Send push notifications if supported
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment reminder sent successfully'
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
