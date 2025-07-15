"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"
import { PlusCircle, Trash2 } from "lucide-react"

const incomeSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  date: z.string().min(1, "A data é obrigatória."),
})

type IncomeFormValues = z.infer<typeof incomeSchema>

interface Income extends IncomeFormValues {
  id: number
}

export function IncomeManager() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      name: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    },
  })

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

  const onSubmit = async (values: IncomeFormValues) => {
    try {
      const response = await fetch("/api/incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Falha ao adicionar renda.")

      const { income } = await response.json()
      setIncomes([income, ...incomes])
      toast.success("Renda adicionada com sucesso!")
      form.reset()
    } catch (error) {
      toast.error("Não foi possível adicionar a renda.")
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Renda</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Salário, Freelance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                
                Adicionar Renda
              </Button>
            </form>
          </Form>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : incomes.length > 0 ? (
                incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{income.name}</TableCell>
                    <TableCell>{new Date(income.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="text-right">{formatCurrency(income.amount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Nenhuma renda registrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
