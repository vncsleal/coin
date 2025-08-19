'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Income } from "@/lib/types"
import { addIncome, updateIncome } from "@/app/actions/incomes"
import { getCategories } from "@/app/actions/categories"
import { INCOME_TAGS } from "@/lib/constants"
import { DatePicker } from "@/components/ui/date-picker"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useToast } from "@/hooks/use-toast"
import { getUserCurrencyPreference } from "@/lib/client-preferences"
import { CURRENCIES } from "@/lib/currency"
import React from "react"

const incomeSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  amount: z.string().min(1, "O valor deve ser positivo."),
  category: z.string().min(1, "A categoria é obrigatória."),
  date: z.date({ required_error: "A data é obrigatória." }),
})

type IncomeFormValues = z.infer<typeof incomeSchema>

interface IncomeFormProps {
  incomeToEdit?: Income;
  onSave?: () => void;
}

export function IncomeForm({ incomeToEdit, onSave }: IncomeFormProps) {
  const [categories, setCategories] = useState<string[]>([])
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: incomeToEdit ? {
      name: incomeToEdit.name,
      amount: incomeToEdit.amount.toString(),
      category: incomeToEdit.category,
      date: new Date(incomeToEdit.date),
    } : {
      name: "",
      amount: "",
      category: "",
      date: new Date(),
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      const customCategories = await getCategories('income');
      const customCategoryNames = customCategories.map(c => c.name);
      const combined = [...new Set([...INCOME_TAGS, ...customCategoryNames])];
      setCategories(combined);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (incomeToEdit) {
      form.reset({
        name: incomeToEdit.name,
        amount: incomeToEdit.amount.toString(),
        category: incomeToEdit.category,
        date: new Date(incomeToEdit.date),
      });
    } else {
      form.reset({
        name: "",
        amount: "",
        category: "",
        date: new Date(),
      });
    }
  }, [incomeToEdit, form]);

  const { toast } = useToast();

  const userCurrencyCode = getUserCurrencyPreference();
  const userCurrency = CURRENCIES[userCurrencyCode];

  const onSubmit = async (values: IncomeFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("amount", values.amount);
      formData.append("category", values.category);
      formData.append("date", values.date.toISOString().split("T")[0]);

      if (incomeToEdit) {
        await updateIncome(incomeToEdit.id, formData);
        toast({
          title: "Sucesso",
          description: "Renda atualizada com sucesso",
        });
        onSave?.();
      } else {
        await addIncome(formData);
        toast({
          title: "Sucesso",
          description: "Renda adicionada com sucesso",
        });
        form.reset({
          name: "",
          amount: "",
          category: "",
          date: new Date(),
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível ${incomeToEdit ? 'atualizar' : 'adicionar'} a renda.`,
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
          name="category"
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
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
          {incomeToEdit ? "Atualizar Renda" : "Adicionar Renda"}
        </Button>
      </form>
    </Form>
  );
}