import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import type { Budget } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/currency"

interface BudgetOverviewProps {
  budget: Budget | null
}

async function getMonthlySpending(userId: string): Promise<number> {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const result = await sql`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses 
    WHERE user_id = ${userId}
    AND EXTRACT(MONTH FROM date) = ${currentMonth}
    AND EXTRACT(YEAR FROM date) = ${currentYear}
  `

  return Number(result[0]?.total || 0)
}

export async function BudgetOverview({ budget }: BudgetOverviewProps) {
  const { userId } = await auth()

  if (!userId || !budget) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum orçamento definido para este mês</div>
  }

  const monthlySpending = await getMonthlySpending(userId)
  const remaining = budget.amount - monthlySpending
  const percentageUsed = (monthlySpending / budget.amount) * 100

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Progresso do Orçamento</span>
        <span className="text-sm text-muted-foreground">{percentageUsed.toFixed(1)}%</span>
      </div>

      <Progress value={Math.min(percentageUsed, 100)} className="w-full" />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Gasto</div>
          <div className="font-bold text-lg">{formatCurrency(monthlySpending)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Restante</div>
          <div className={`font-bold text-lg ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(remaining)}
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-muted-foreground text-sm">Orçamento Total</div>
        <div className="font-bold text-xl">{formatCurrency(budget.amount)}</div>
      </div>

      {remaining < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          ⚠️ Você excedeu seu orçamento em {formatCurrency(Math.abs(remaining))}
        </div>
      )}
    </div>
  )
}
