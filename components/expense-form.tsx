'use client'

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addExpense, updateExpense } from "@/app/actions/expenses"
import type { Expense } from "@/lib/types"

import { DatePicker } from "@/components/ui/date-picker"
import { CurrencyInput } from "@/components/ui/currency-input"
import { EXPENSE_TAGS } from "@/lib/constants"
import { getUserCurrencyPreference } from "@/lib/client-preferences"
import { CURRENCIES } from "@/lib/currency"
import React from "react"

const expenseSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  amount: z.string().min(1, "O valor deve ser positivo."),
  tag: z.string().min(1, "A categoria é obrigatória."),
  date: z.date({ required_error: "A data é obrigatória." }),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  expenseToEdit?: Expense;
  onSave?: () => void;
}

export function ExpenseForm({ expenseToEdit, onSave }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expenseToEdit ? {
      name: expenseToEdit.name,
      amount: expenseToEdit.amount.toString(),
      tag: expenseToEdit.tag,
      date: new Date(expenseToEdit.date),
    } : {
      name: "",
      amount: "",
      tag: "",
      date: new Date(),
    },
  });

  useEffect(() => {
    if (expenseToEdit) {
      form.reset({
        name: expenseToEdit.name,
        amount: expenseToEdit.amount.toString(),
        tag: expenseToEdit.tag,
        date: new Date(expenseToEdit.date),
      });
    } else {
      form.reset({
        name: "",
        amount: "",
        tag: "",
        date: new Date(),
      });
    }
  }, [expenseToEdit, form]);

  const { toast } = useToast();

  const userCurrencyCode = getUserCurrencyPreference();
  const userCurrency = CURRENCIES[userCurrencyCode];

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("amount", values.amount);
      formData.append("tag", values.tag);
      formData.append("date", values.date.toISOString().split("T")[0]);

      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, formData);
        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso",
        });
        onSave?.();
      } else {
        await addExpense(formData);
        toast({
          title: "Sucesso",
          description: "Despesa adicionada com sucesso",
        });
        form.reset({
          name: "",
          amount: "",
          tag: "",
          date: new Date(),
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível ${expenseToEdit ? 'atualizar' : 'adicionar'} a despesa.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Despesa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aluguel, Compras" {...field} />
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
                <CurrencyInput 
                  placeholder={userCurrency.symbol + " 0,00"} 
                  value={field.value}
                  onValueChange={field.onChange} 
                  currencyCode={userCurrencyCode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_TAGS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <DatePicker value={field.value} onChange={React.useCallback(field.onChange, [field.onChange])} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {expenseToEdit ? "Atualizar Despesa" : "Adicionar Despesa"}
        </Button>
      </form>
    </Form>
  );
}
