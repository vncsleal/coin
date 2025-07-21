"use client"

import { deleteExpense } from "@/app/actions/expenses"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency"
import { Expense } from "@/lib/types"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EditExpenseModal } from "./EditExpenseModal"

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
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.name}</TableCell>
                <TableCell className="text-muted-foreground">{expense.tag}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
                <TableCell className="text-right font-semibold text-red-600">{formatCurrency(expense.amount)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EditExpenseModal expense={expense} />
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{expense.name}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Categoria:</span> {expense.tag}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <EditExpenseModal expense={expense} />
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)} className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">Valor</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
