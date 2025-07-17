"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addExpense, updateExpense } from "@/app/actions/expenses"
import type { Expense } from "@/lib/types"

import { DatePicker } from "@/components/ui/date-picker"
import { CurrencyInput } from "@/components/ui/currency-input"
import { EXPENSE_TAGS } from "@/lib/constants"
import { getUserCurrencyPreference } from "@/lib/client-preferences"
import { CURRENCIES } from "@/lib/currency"

interface ExpenseFormProps {
  expenseToEdit?: Expense;
  onSave?: () => void;
}

export function ExpenseForm({ expenseToEdit, onSave }: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState(expenseToEdit?.name || '');
  const [amount, setAmount] = useState(expenseToEdit?.amount.toString() || '');
  const [tag, setTag] = useState(expenseToEdit?.tag || '');
  const [date, setDate] = useState<Date | undefined>(
    expenseToEdit?.date ? new Date(expenseToEdit.date) : new Date()
  );

  const userCurrencyCode = getUserCurrencyPreference();
  const userCurrency = CURRENCIES[userCurrencyCode];

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    formData.set("date", date?.toISOString().split("T")[0] || "");

    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, formData)
        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso",
        })
      } else {
        await addExpense(formData)
        toast({
          title: "Sucesso",
          description: "Despesa adicionada com sucesso",
        })
      }
      router.refresh()
      onSave?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao ${expenseToEdit ? 'atualizar' : 'adicionar'} despesa`,
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
        <Input id="name" name="name" placeholder="Digite o nome da despesa" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <CurrencyInput 
          id="amount" 
          name="amount" 
          placeholder={userCurrency.symbol + " 0,00"} 
          required 
          value={amount} 
          onValueChange={(value) => setAmount(value || '')} 
          currencyCode={userCurrencyCode}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag">Categoria</Label>
        <Select name="tag" required value={tag} onValueChange={setTag}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_TAGS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Data</Label>
        <DatePicker value={date} onChangeAction={setDate} />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (expenseToEdit ? "Atualizando..." : "Adicionando...") : (expenseToEdit ? "Atualizar Despesa" : "Adicionar Despesa")}
      </Button>
    </form>
  )
}
