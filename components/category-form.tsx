'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { addCategory, updateCategory } from "@/app/actions/categories"

const categorySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  categoryToEdit?: { id: string, name: string };
  type: 'expense' | 'income';
  onSave?: () => void;
}

export function CategoryForm({ categoryToEdit, type, onSave }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: categoryToEdit?.name || "" },
  });

  const { toast } = useToast();

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, values.name);
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso",
        });
      } else {
        await addCategory(values.name, type);
        toast({
          title: "Sucesso",
          description: "Categoria adicionada com sucesso",
        });
      }
      form.reset({ name: "" });
      onSave?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível ${categoryToEdit ? 'atualizar' : 'adicionar'} a categoria.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Nome da categoria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {categoryToEdit ? "Atualizar" : "Adicionar"}
        </Button>
      </form>
    </Form>
  );
}
