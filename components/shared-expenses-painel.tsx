import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ArrowRightLeft, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { getSharedPainelStats } from '@/app/actions/shared-expenses';
import { AICounselingModal } from '@/components/AICounselingModal';

export async function SharedExpensesPainel() {
  const stats = await getSharedPainelStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Gasto Coletivo</CardTitle>
          </div>
          <AICounselingModal counselingType="shared_expenses_painel_summary" data={stats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
          <p className="text-xs text-muted-foreground">Soma de todas as despesas compartilhadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Minha Parte</CardTitle>
          </div>
          <AICounselingModal counselingType="shared_expenses_painel_summary" data={stats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.myShare)}</div>
          <p className="text-xs text-muted-foreground">Minha responsabilidade no total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Eu Devo</CardTitle>
          </div>
          <AICounselingModal counselingType="shared_expenses_painel_summary" data={stats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(stats.iOwe)}</div>
          <p className="text-xs text-muted-foreground">Quanto preciso pagar aos meus amigos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Me Devem</CardTitle>
          </div>
          <AICounselingModal counselingType="shared_expenses_painel_summary" data={stats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.theyOweMe)}</div>
          <p className="text-xs text-muted-foreground">Quanto meus amigos precisam me pagar</p>
        </CardContent>
      </Card>
    </div>
  );
}