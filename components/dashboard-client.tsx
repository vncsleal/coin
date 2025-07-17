'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpenseChart } from "@/components/expense-chart"
import { ExpensePieChart } from "@/components/expense-pie-chart"
import { DollarSign, TrendingUp, Target, TrendingDown, Scale } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { AICounselingModal } from "@/components/AICounselingModal"
import { IncomeChart } from "@/components/income-chart"
import type { DashboardStats } from "@/lib/types"

interface DashboardClientProps {
  stats: DashboardStats
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const [showAmounts, setShowAmounts] = useState(false)

  // Load preference from localStorage on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('show-amounts')
    if (savedPreference !== null) {
      setShowAmounts(JSON.parse(savedPreference))
    }

    // Listen for amount visibility changes
    const handleAmountVisibilityChange = (event: CustomEvent) => {
      setShowAmounts(event.detail.showAmounts)
    }

    window.addEventListener('amountVisibilityChange', handleAmountVisibilityChange as EventListener)
    
    return () => {
      window.removeEventListener('amountVisibilityChange', handleAmountVisibilityChange as EventListener)
    }
  }, [])

  const formatAmount = (amount: number) => {
    return showAmounts ? formatCurrency(amount) : "••••••"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
        <p className="text-muted-foreground">Visão geral da sua atividade financeira neste mês</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
            </div>
            <AICounselingModal counselingType="monthly_income" data={stats} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(stats.monthlyIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Despesa Mensal</CardTitle>
            </div>
            <AICounselingModal counselingType="monthly_expenditure" data={stats} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatAmount(stats.monthlyExpenditure)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Despesa Mensal Compartilhada</CardTitle>
            </div>
            <AICounselingModal counselingType="monthly_shared_expenditure" data={stats} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatAmount(stats.monthlySharedExpenditure)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
            </div>
            <AICounselingModal counselingType="net_balance" data={stats} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netBalance < 0 ? "text-red-600" : "text-green-600"}`}>
              {formatAmount(stats.netBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Orçamento Restante</CardTitle>
            </div>
            <AICounselingModal counselingType="remaining_budget" data={stats} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
              {formatAmount(stats.remainingBudget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            </div>
            <AICounselingModal counselingType="daily_average" data={stats} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.dailyAverage)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rendas Mensais</CardTitle>
              <CardDescription>Suas fontes de renda ao longo do mês</CardDescription>
            </div>
            <AICounselingModal counselingType="monthly_incomes_chart" data={stats} />
          </CardHeader>
          <CardContent className="pl-2">
            <IncomeChart data={stats.monthlyIncomes} showAmounts={showAmounts} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Despesas Mensais</CardTitle>
              <CardDescription>Seus gastos diários ao longo do mês</CardDescription>
            </div>
            <AICounselingModal counselingType="monthly_expenses_chart" data={stats} />
          </CardHeader>
          <CardContent className="pl-2">
            <ExpenseChart data={stats.monthlyExpenses} showAmounts={showAmounts} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>Detalhamento do mês atual</CardDescription>
            </div>
            <AICounselingModal counselingType="expenses_by_category_chart" data={stats} />
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={stats.expensesByTag} showAmounts={showAmounts} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Total de Despesas por Categoria</CardTitle>
              <CardDescription>Detalhamento de gastos de todos os tempos</CardDescription>
            </div>
            <AICounselingModal counselingType="total_expenses_by_category_chart" data={stats} />
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={stats.totalExpensesByTag} showAmounts={showAmounts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
