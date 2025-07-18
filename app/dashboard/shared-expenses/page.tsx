import { SharedExpensesPainel } from '@/components/shared-expenses-painel';
import { SharedExpensesTabs } from '@/components/shared-expenses-tabs';
import { getSharedExpenses, getMonthlySharedExpensesChartData, getSharedExpensesByCategoryData, getSharedPainelStats } from '@/app/actions/shared-expenses';

export default async function SharedExpensesPage() {
  const sharedExpenses = await getSharedExpenses();
  const monthlyChartData = await getMonthlySharedExpensesChartData();
  const categoryChartData = await getSharedExpensesByCategoryData();
  const painelStats = await getSharedPainelStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Despesas Compartilhadas</h1>
        <p className="text-muted-foreground">Gerencie despesas divididas com seus amigos.</p>
      </div>
      <SharedExpensesTabs 
        painel={<SharedExpensesPainel />} 
        sharedExpenses={sharedExpenses}
        monthlyChartData={monthlyChartData}
        categoryChartData={categoryChartData}
        painelStats={painelStats}
      />
    </div>
  );
}
