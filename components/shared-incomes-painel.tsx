"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { AICounselingModal } from "@/components/AICounselingModal"

interface SharedIncomesPainelProps {
  painelStats: {
    totalJointSavings: number;
    myTotalContribution: number;
    friendTotalContribution: number;
  };
}

export function SharedIncomesPainel({ painelStats }: SharedIncomesPainelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Economizado Juntos</CardTitle>
          <AICounselingModal counselingType="shared_incomes_painel_summary" data={painelStats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(painelStats.totalJointSavings)}</div>
          <p className="text-xs text-muted-foreground">Soma total das economias conjuntas.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Minha Contribuição</CardTitle>
          <AICounselingModal counselingType="shared_incomes_painel_summary" data={painelStats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(painelStats.myTotalContribution)}</div>
          <p className="text-xs text-muted-foreground">Sua contribuição para a economia conjunta.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contribuição do Amigo</CardTitle>
          <AICounselingModal counselingType="shared_incomes_painel_summary" data={painelStats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(painelStats.friendTotalContribution)}</div>
          <p className="text-xs text-muted-foreground">Contribuição do seu amigo para a economia conjunta.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balanço Conjunto</CardTitle>
          <AICounselingModal counselingType="shared_incomes_painel_summary" data={painelStats} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(painelStats.myTotalContribution - painelStats.friendTotalContribution)}</div>
          <p className="text-xs text-muted-foreground">Diferença entre sua contribuição e a do seu amigo.</p>
        </CardContent>
      </Card>
    </div>
  )
}
