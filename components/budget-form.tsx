"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { setBudget } from "@/app/actions/budget"
import type { Budget } from "@/lib/types"

interface BudgetFormProps {
  currentBudget: Budget | null
}

export function BudgetForm({ currentBudget }: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      await setBudget(formData)
      toast({
        title: "Sucesso",
        description: "Orçamento atualizado com sucesso",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar orçamento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Valor do Orçamento Mensal</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={currentBudget?.amount || ""}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : currentBudget ? "Atualizar Orçamento" : "Definir Orçamento"}
      </Button>
    </form>
  )
}
