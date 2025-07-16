"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addExpense } from "@/app/actions/expenses"

import { EXPENSE_TAGS } from "@/lib/constants"

export function ExpenseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      await addExpense(formData)
      toast({
        title: "Sucesso",
        description: "Despesa adicionada com sucesso",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar despesa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Despesa</Label>
        <Input id="name" name="name" placeholder="Digite o nome da despesa" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag">Categoria</Label>
        <Select name="tag" required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_TAGS.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adicionando..." : "Adicionar Despesa"}
      </Button>
    </form>
  )
}
