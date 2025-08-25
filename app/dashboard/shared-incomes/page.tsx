import { SharedIncomesTabs } from '@/components/shared-incomes-tabs';
import { getSharedIncomes, getMonthlySharedIncomesChartData, getSharedIncomesByCategoryData, getSharedPainelStats } from '@/app/actions/shared-incomes';
import { MonthPicker } from '@/components/ui/month-picker';

export default async function SharedIncomesPage({ searchParams }: { searchParams: { month?: string, year?: string } }) {
  const currentDate = new Date();
  const month = searchParams.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1;
  const year = searchParams.year ? parseInt(searchParams.year) : currentDate.getFullYear();

  const sharedIncomes = await getSharedIncomes(month, year);
  const monthlyChartData = await getMonthlySharedIncomesChartData(year);
  const categoryChartData = await getSharedIncomesByCategoryData(month, year);
  const painelStats = await getSharedPainelStats(month, year);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Rendas Compartilhadas</h1>
          <p className="text-muted-foreground">Gerencie rendas divididas com seus amigos.</p>
        </div>
        <div className="w-full lg:w-auto">
          <MonthPicker month={month} year={year} path="/dashboard/shared-incomes" />
        </div>
      </div>
      <SharedIncomesTabs 
        sharedIncomes={sharedIncomes}
        monthlyChartData={monthlyChartData}
        categoryChartData={categoryChartData}
        painelStats={painelStats}
      />
    </div>
  );
}
