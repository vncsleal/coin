"use client"

import type { Expense } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { deleteExpense } from "@/app/actions/expenses"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ExpenseListProps {
  expenses: Expense[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete(id: number) {
    try {
      await deleteExpense(id)
      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao excluir despesa",
        variant: "destructive",
      })
    }
  }

  if (expenses.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma despesa registrada ainda</div>
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {expenses.slice(0, 10).map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{expense.name}</span>
                  <Badge variant="secondary">{expense.tag}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{formatCurrency(expense.amount)}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
