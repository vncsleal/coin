import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ArrowRightLeft, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { getSharedPainelStats } from '@/app/actions/shared-expenses';

export async function SharedExpensesPainel() {
  const stats = await getSharedPainelStats();

  const balanceColorClass = stats.balance >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            
            <CardTitle className="text-sm font-medium">Gasto Coletivo</CardTitle>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
          <p className="text-xs text-muted-foreground">Soma de todas as despesas compartilhadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            
            <CardTitle className="text-sm font-medium">Minha Parte Devida</CardTitle>
          </div>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.myDuePortion)}</div>
          <p className="text-xs text-muted-foreground">Minha responsabilidade no total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            
            <CardTitle className="text-sm font-medium">Total Pago por Mim</CardTitle>
          </div>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalPaidByMe)}</div>
          <p className="text-xs text-muted-foreground">Valor total que paguei em despesas compartilhadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            
            <CardTitle className="text-sm font-medium">Balanço</CardTitle>
          </div>
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balanceColorClass}`}>{formatCurrency(stats.balance)}</div>
          <p className="text-xs text-muted-foreground">Diferença entre o que paguei e minha parte devida (apenas despesas pendentes)</p>
        </CardContent>
      </Card>
    </div>
  );
}
