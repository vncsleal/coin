"use client"

import { deleteExpense } from "@/app/actions/expenses"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
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
    <div className="rounded-md border">
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
              <TableCell className="text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</TableCell>
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
  )
}
