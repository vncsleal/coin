import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUserInDatabase } from '@/lib/user-management';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  try {
    await ensureUserInDatabase();
    
    const expenseId = parseInt(params.id);

    // Get settlements with participant information
    const settlements = await sql`
      SELECT 
        ses.*,
        debtor.email as debtor_email,
        debtor.display_name as debtor_name,
        debtor.avatar_url as debtor_avatar,
        creditor.email as creditor_email,
        creditor.display_name as creditor_name,
        creditor.avatar_url as creditor_avatar
      FROM shared_expense_settlements ses
      JOIN users debtor ON ses.debtor_id = debtor.id
      JOIN users creditor ON ses.creditor_id = creditor.id
      WHERE ses.shared_expense_id = ${expenseId}
      ORDER BY ses.created_at DESC
    `;

    return NextResponse.json({ settlements });
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 });
  }
}
