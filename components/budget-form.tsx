"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { setBudget } from "@/app/actions/budget"
import type { Budget } from "@/lib/types"
import { CurrencyInput } from "@/components/ui/currency-input"
import { getUserCurrencyPreference } from "@/lib/client-preferences"
import { CURRENCIES } from "@/lib/currency"

interface BudgetFormProps {
  currentBudget: Budget | null
}

export function BudgetForm({ currentBudget }: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const userCurrencyCode = getUserCurrencyPreference();
  const userCurrency = CURRENCIES[userCurrencyCode];

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
        <CurrencyInput
          id="amount"
          name="amount"
          placeholder={userCurrency.symbol + " 0,00"}
          defaultValue={currentBudget?.amount.toString() || ""}
          required
          currencyCode={userCurrencyCode}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : currentBudget ? "Atualizar Orçamento" : "Definir Orçamento"}
      </Button>
    </form>
  )
}
