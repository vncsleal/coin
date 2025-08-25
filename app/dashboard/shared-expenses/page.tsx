import { SharedExpensesPainel } from '@/components/shared-expenses-painel';
import { SharedExpensesTabs } from '@/components/shared-expenses-tabs';
import { getSharedExpenses, getMonthlySharedExpensesChartData, getSharedExpensesByCategoryData, getSharedPainelStats } from '@/app/actions/shared-expenses';
import { MonthPicker } from '@/components/ui/month-picker';

export default async function SharedExpensesPage({ searchParams }: { searchParams: { month?: string, year?: string } }) {
  const currentDate = new Date();
  const month = searchParams.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1;
  const year = searchParams.year ? parseInt(searchParams.year) : currentDate.getFullYear();

  const sharedExpenses = await getSharedExpenses(month, year);
  const monthlyChartData = await getMonthlySharedExpensesChartData(year);
  const categoryChartData = await getSharedExpensesByCategoryData(month, year);
  const painelStats = await getSharedPainelStats(month, year);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Despesas Compartilhadas</h1>
          <p className="text-muted-foreground">Gerencie despesas divididas com seus amigos.</p>
        </div>
        <div className="w-full lg:w-auto">
          <MonthPicker month={month} year={year} path="/dashboard/shared-expenses" />
        </div>
      </div>
      <SharedExpensesTabs 
        painel={<SharedExpensesPainel painelStats={painelStats} />} 
        sharedExpenses={sharedExpenses}
        monthlyChartData={monthlyChartData}
        categoryChartData={categoryChartData}
        painelStats={painelStats}
      />
    </div>
  );
}
