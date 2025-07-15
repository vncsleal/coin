import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUserInDatabase } from '@/lib/user-management';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

  try {
    await ensureUserInDatabase();
    
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '6months';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default: // 6months
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    // Get current user's DB ID
    const userResult = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const currentUserId = userResult[0].id;

    // 1. Monthly Trends
    const monthlyTrends = await sql`
      SELECT 
        TO_CHAR(se.date, 'YYYY-MM') as month,
        SUM(se.total_amount) as total_amount,
        COUNT(se.id) as expense_count,
        COALESCE(SUM(CASE 
          WHEN ses.status = 'confirmed' THEN ses.amount 
          ELSE 0 
        END), 0) as settled_amount,
        COALESCE(SUM(CASE 
          WHEN ses.status != 'confirmed' OR ses.status IS NULL THEN ses.amount 
          ELSE 0 
        END), 0) as pending_amount
      FROM shared_expenses se
      JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
      LEFT JOIN shared_expense_settlements ses ON se.id = ses.shared_expense_id
      WHERE sep.user_id = ${currentUserId}
        AND se.date >= ${startDate.toISOString().split('T')[0]}
      GROUP BY TO_CHAR(se.date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    // 2. Category Breakdown
    const categoryBreakdown = await sql`
      SELECT 
        se.tag as category,
        SUM(sep.share_amount) as amount,
        COUNT(se.id) as count
      FROM shared_expenses se
      JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
      WHERE sep.user_id = ${currentUserId}
        AND se.date >= ${startDate.toISOString().split('T')[0]}
      GROUP BY se.tag
      ORDER BY amount DESC
    `;

    // Calculate percentages for categories
    const totalCategoryAmount = categoryBreakdown.reduce((sum: number, cat: any) => sum + parseFloat(cat.amount), 0);
    const categoryBreakdownWithPercentages = categoryBreakdown.map((cat: any) => ({
      ...cat,
      amount: parseFloat(cat.amount),
      percentage: totalCategoryAmount > 0 ? (parseFloat(cat.amount) / totalCategoryAmount) * 100 : 0
    }));

    // 3. Friend Analysis
    const friendAnalysis = await sql`
      SELECT 
        u.id as friend_id,
        u.display_name as friend_name,
        u.email as friend_email,
        SUM(sep2.share_amount) as total_shared,
        COUNT(DISTINCT se.id) as expense_count,
        COALESCE(SUM(CASE 
          WHEN ses.status = 'confirmed' THEN ses.amount 
          ELSE 0 
        END), 0) as settled_amount,
        COALESCE(SUM(CASE 
          WHEN ses.status != 'confirmed' OR ses.status IS NULL THEN ses.amount 
          ELSE 0 
        END), 0) as pending_amount
      FROM shared_expenses se
      JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
      JOIN shared_expense_participants sep2 ON se.id = sep2.shared_expense_id
      JOIN users u ON sep2.user_id = u.id
      LEFT JOIN shared_expense_settlements ses ON se.id = ses.shared_expense_id 
        AND (ses.debtor_id = u.id OR ses.creditor_id = u.id)
      WHERE sep.user_id = ${currentUserId}
        AND sep2.user_id != ${currentUserId}
        AND se.date >= ${startDate.toISOString().split('T')[0]}
      GROUP BY u.id, u.display_name, u.email
      ORDER BY total_shared DESC
      LIMIT 10
    `;

    // 4. Settlement Overview
    const settlementOverview = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN ses.creditor_id = ${currentUserId} AND ses.status != 'confirmed' THEN ses.amount ELSE 0 END), 0) as total_owed,
        COALESCE(SUM(CASE WHEN ses.debtor_id = ${currentUserId} AND ses.status != 'confirmed' THEN ses.amount ELSE 0 END), 0) as total_owing,
        COALESCE(SUM(CASE WHEN ses.status = 'confirmed' THEN ses.amount ELSE 0 END), 0) as total_settled,
        COUNT(CASE WHEN ses.status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN ses.status = 'paid' AND ses.created_at < NOW() - INTERVAL '7 days' THEN 1 END) as overdue_count
      FROM shared_expense_settlements ses
      JOIN shared_expenses se ON ses.shared_expense_id = se.id
      WHERE (ses.debtor_id = ${currentUserId} OR ses.creditor_id = ${currentUserId})
        AND se.date >= ${startDate.toISOString().split('T')[0]}
    `;

    // 5. Summary Statistics
    const summary = await sql`
      SELECT 
        COUNT(DISTINCT se.id) as total_expenses,
        COALESCE(SUM(sep.share_amount), 0) as total_amount,
        COALESCE(AVG(sep.share_amount), 0) as average_expense
      FROM shared_expenses se
      JOIN shared_expense_participants sep ON se.id = sep.shared_expense_id
      WHERE sep.user_id = ${currentUserId}
        AND se.date >= ${startDate.toISOString().split('T')[0]}
    `;

    // Calculate additional summary metrics
    const topCategory = categoryBreakdownWithPercentages[0]?.category || null;
    const mostActiveMonth = monthlyTrends[0]?.month || null;
    
    const totalSettlements = await sql`
      SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed
      FROM shared_expense_settlements ses
      JOIN shared_expenses se ON ses.shared_expense_id = se.id
      WHERE (ses.debtor_id = ${currentUserId} OR ses.creditor_id = ${currentUserId})
        AND se.date >= ${startDate.toISOString().split('T')[0]}
    `;
    
    const settlementRate = totalSettlements[0]?.total > 0 
      ? (parseInt(totalSettlements[0].confirmed) / parseInt(totalSettlements[0].total)) * 100 
      : 0;

    // Format the response
    const analyticsData = {
      monthlyTrends: monthlyTrends.map((trend: any) => ({
        month: trend.month,
        totalAmount: parseFloat(trend.total_amount || 0),
        expenseCount: parseInt(trend.expense_count || 0),
        settledAmount: parseFloat(trend.settled_amount || 0),
        pendingAmount: parseFloat(trend.pending_amount || 0)
      })).reverse(), // Show oldest to newest for charts
      
      categoryBreakdown: categoryBreakdownWithPercentages,
      
      friendAnalysis: friendAnalysis.map((friend: any) => ({
        friendId: friend.friend_id,
        friendName: friend.friend_name,
        friendEmail: friend.friend_email,
        totalShared: parseFloat(friend.total_shared || 0),
        expenseCount: parseInt(friend.expense_count || 0),
        settledAmount: parseFloat(friend.settled_amount || 0),
        pendingAmount: parseFloat(friend.pending_amount || 0)
      })),
      
      settlementOverview: {
        totalOwed: parseFloat(settlementOverview[0]?.total_owed || 0),
        totalOwing: parseFloat(settlementOverview[0]?.total_owing || 0),
        totalSettled: parseFloat(settlementOverview[0]?.total_settled || 0),
        pendingCount: parseInt(settlementOverview[0]?.pending_count || 0),
        overdueCount: parseInt(settlementOverview[0]?.overdue_count || 0)
      },
      
      summary: {
        totalExpenses: parseInt(summary[0]?.total_expenses || 0),
        totalAmount: parseFloat(summary[0]?.total_amount || 0),
        averageExpense: parseFloat(summary[0]?.average_expense || 0),
        mostActiveMonth,
        topCategory,
        settlementRate
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
