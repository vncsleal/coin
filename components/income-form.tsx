"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Income } from "@/lib/types"
import { addIncome, updateIncome } from "@/app/actions/incomes"
import { useToast } from "@/hooks/use-toast";

const incomeSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  date: z.string().min(1, "A data é obrigatória."),
})

type IncomeFormValues = z.infer<typeof incomeSchema>

interface IncomeFormProps {
  incomeToEdit?: Income;
  onSave?: () => void;
}

export function IncomeForm({ incomeToEdit, onSave }: IncomeFormProps) {
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: incomeToEdit ? {
      name: incomeToEdit.name,
      amount: incomeToEdit.amount,
      date: new Date(incomeToEdit.date).toISOString().split("T")[0],
    } : {
      name: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (incomeToEdit) {
      form.reset({
        name: incomeToEdit.name,
        amount: incomeToEdit.amount,
        date: new Date(incomeToEdit.date).toISOString().split("T")[0],
      });
    }
  }, [incomeToEdit, form]);

  const { toast } = useToast();

  const onSubmit = async (values: IncomeFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("amount", values.amount.toString());
      formData.append("date", values.date);

      if (incomeToEdit) {
        await updateIncome(incomeToEdit.id, formData);
        toast({
          title: "Sucesso",
          description: "Renda atualizada com sucesso",
        });
      } else {
        await addIncome(formData);
        toast({
          title: "Sucesso",
          description: "Renda adicionada com sucesso",
        });
      }
      onSave?.();
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
          {incomeToEdit ? "Atualizar Renda" : "Adicionar Renda"}
        </Button>
      </form>
    </Form>
  );
}
