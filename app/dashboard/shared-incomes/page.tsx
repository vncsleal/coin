import { SharedIncomesTabs } from '@/components/shared-incomes-tabs';
import { getSharedIncomes, getMonthlySharedIncomesChartData, getSharedIncomesByCategoryData, getSharedPainelStats } from '@/app/actions/shared-incomes';

export default async function SharedIncomesPage() {
  const sharedIncomes = await getSharedIncomes();
  const monthlyChartData = await getMonthlySharedIncomesChartData();
  const categoryChartData = await getSharedIncomesByCategoryData();
  const painelStats = await getSharedPainelStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rendas Compartilhadas</h1>
        <p className="text-muted-foreground">Gerencie rendas divididas com seus amigos.</p>
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
