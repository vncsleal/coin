"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"
import { PlusCircle, Trash2, Pencil } from "lucide-react"
import { Income } from "@/lib/types"
import { IncomeForm } from "@/components/income-form"
import { EditIncomeModal } from "@/components/EditIncomeModal"

export function IncomeManager() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchIncomes() {
    try {
      const response = await fetch("/api/incomes")
      if (!response.ok) throw new Error("Falha ao buscar rendas.")
      const data = await response.json()
      setIncomes(data.incomes)
    } catch (error) {
      toast.error("Não foi possível carregar as rendas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIncomes()
  }, [])

  async function handleDelete(id: number) {
    try {
      const response = await fetch("/api/incomes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Falha ao excluir renda.");

      toast.success("Renda excluída com sucesso!");
      fetchIncomes(); // Refresh the list
    } catch (error) {
      toast.error("Não foi possível excluir a renda.");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Renda</CardTitle>
          <CardDescription>Preencha os detalhes da sua nova fonte de renda.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeForm onSave={fetchIncomes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendas Registradas</CardTitle>
          <CardDescription>Sua lista de rendas para o período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : incomes.length > 0 ? (
                incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{income.name}</TableCell>
                    <TableCell>{new Date(income.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="text-right">{formatCurrency(income.amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditIncomeModal income={income} />
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(income.id)} className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Nenhuma renda registrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
