import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`);

    const { searchParams } = new URL(request.url);
    const chartType = searchParams.get('type');

    let chartData;

    switch (chartType) {
      case 'monthly_shared_expenses':
        chartData = await sql`
          SELECT
            TO_CHAR(date, 'YYYY-MM') as month,
            SUM(total_amount) as total
          FROM shared_expenses
          WHERE paid_by_user_id = ${userId} OR shared_with_user_id = ${userId}
          GROUP BY month
          ORDER BY month;
        `;
        break;
      case 'shared_expenses_by_category':
        chartData = await sql`
          SELECT
            category,
            SUM(total_amount) as total
          FROM shared_expenses
          WHERE paid_by_user_id = ${userId} OR shared_with_user_id = ${userId}
          GROUP BY category
          ORDER BY total DESC;
        `;
        break;
      default:
        return NextResponse.json({ error: 'Invalid chart type' }, { status: 400 });
    }

    return NextResponse.json({ chartData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shared expenses chart data:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
