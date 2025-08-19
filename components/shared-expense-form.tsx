'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from '@/lib/utils';
import { EXPENSE_TAGS } from '@/lib/constants';
import { getCategories } from '@/app/actions/categories';
import { addSharedExpense, updateSharedExpense } from '@/app/actions/shared-expenses';
import { useToast } from "@/hooks/use-toast";
import { getUserCurrencyPreference } from "@/lib/client-preferences";
import { CURRENCIES } from "@/lib/currency";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { SharedExpense } from '@/lib/types';

interface Friend {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
}

const sharedExpenseSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória."),
  total_amount: z.string().min(1, "O valor deve ser positivo."),
  date: z.date({ required_error: "A data é obrigatória." }),
  category: z.string().optional(),
  shared_with_user_id: z.string().min(1, "Selecione um amigo."),
});

type SharedExpenseFormValues = z.infer<typeof sharedExpenseSchema>;

interface SharedExpenseFormProps {
  expenseToEdit?: SharedExpense;
  onSave?: () => void;
}

export function SharedExpenseForm({ expenseToEdit, onSave }: SharedExpenseFormProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<SharedExpenseFormValues>({
    resolver: zodResolver(sharedExpenseSchema),
    defaultValues: expenseToEdit ? {
      description: expenseToEdit.description,
      total_amount: expenseToEdit.total_amount.toString(),
      date: new Date(expenseToEdit.date),
      category: expenseToEdit.category || "",
      shared_with_user_id: expenseToEdit.shared_with_user_id,
    } : {
      description: "",
      total_amount: "",
      date: new Date(),
      category: "",
      shared_with_user_id: "",
    },
  });

  const userCurrencyCode = getUserCurrencyPreference();
  const userCurrency = CURRENCIES[userCurrencyCode];

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends/list');
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        const data = await response.json();
        setFriends(data.friends);
      } catch (error) {
        console.error('Error fetching friends:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar amigos.',
          variant: "destructive",
        });
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const customCategories = await getCategories('expense');
      const customCategoryNames = customCategories.map(c => c.name);
      const combined = [...new Set([...EXPENSE_TAGS, ...customCategoryNames])];
      setCategories(combined);
    }
    fetchCategories();
  }, []);

  const onSubmit = async (values: SharedExpenseFormValues) => {
    try {
      const formData = new FormData();
      formData.append("description", values.description);
      formData.append("total_amount", values.total_amount);
      formData.append("date", values.date.toISOString().split("T")[0]);
      formData.append("category", values.category || '');
      formData.append("shared_with_user_id", values.shared_with_user_id);

      if (expenseToEdit) {
        await updateSharedExpense(expenseToEdit.id, formData);
        toast({
          title: 'Despesa compartilhada atualizada com sucesso!',
        });
      } else {
        await addSharedExpense(formData);
        toast({
          title: 'Despesa compartilhada criada com sucesso!',
        });
        form.reset();
      }
      onSave?.();
    } catch (error) {
      console.error('Error creating/updating shared expense:', error);
      toast({
        title: `Falha ao ${expenseToEdit ? 'atualizar' : 'criar'} despesa compartilhada.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Almoço com amigos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total</FormLabel>
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <DatePicker value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
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
          name="shared_with_user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compartilhar com</FormLabel>
              {friends.length === 0 ? (
                <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Nenhum amigo disponível</p>
                    <p className="text-xs text-muted-foreground mt-1">Adicione amigos na página de Amigos</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => field.onChange(friend.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200",
                        field.value === friend.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={friend.avatar_url || "/placeholder-user.jpg"} alt={friend.display_name || friend.email} />
                        <AvatarFallback className="text-xs font-medium">
                          {(friend.display_name || friend.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium text-sm truncate">
                          {friend.display_name || 'Usuário'}
                        </span>
                        <span className={cn(
                          "text-xs truncate",
                          field.value === friend.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {friend.email}
                        </span>
                      </div>
                      {field.value === friend.id && (
                        <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {expenseToEdit ? 'Atualizar Despesa Compartilhada' : 'Registrar Despesa Compartilhada'}
        </Button>
      </form>
    </Form>
  );
}
