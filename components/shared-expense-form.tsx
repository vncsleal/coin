'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EXPENSE_TAGS } from '@/lib/constants';
import { addSharedExpense, updateSharedExpense } from '@/app/actions/shared-expenses';

interface SharedExpense {
  id: string;
  description: string;
  total_amount: number;
  date: string;
  category?: string;
  paid_by_user_id: string;
  shared_with_user_id: string;
  status: 'unsettled' | 'settled';
  paid_by_user_name: string;
  shared_with_user_name: string;
}

interface Friend {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
}

interface SharedExpenseFormProps {
  expenseToEdit?: SharedExpense;
  onSave?: () => void;
}

export function SharedExpenseForm({ expenseToEdit, onSave }: SharedExpenseFormProps) {
  const [description, setDescription] = useState(expenseToEdit?.description || '');
  const [amount, setAmount] = useState<string>(expenseToEdit?.total_amount.toString() || '');
  const [date, setDate] = useState<Date | undefined>(expenseToEdit?.date ? new Date(expenseToEdit.date) : new Date());
  const [category, setCategory] = useState(expenseToEdit?.category || '');
  const [selectedFriend, setSelectedFriend] = useState<string>(expenseToEdit?.shared_with_user_id || '');
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    fetchFriends();
  }, []);

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
      toast.error('Failed to load friends.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !selectedFriend) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("total_amount", amount);
      formData.append("date", date.toISOString().split('T')[0]);
      formData.append("category", category);
      formData.append("shared_with_user_id", selectedFriend);

      if (expenseToEdit) {
        await updateSharedExpense(expenseToEdit.id, formData);
        toast.success('Despesa compartilhada atualizada com sucesso!');
      } else {
        await addSharedExpense(formData);
        toast.success('Despesa compartilhada criada com sucesso!');
      }

      if (!expenseToEdit) {
        setDescription('');
        setAmount('');
        setDate(new Date());
        setCategory('');
        setSelectedFriend('');
      }
      onSave?.();
    } catch (error) {
      console.error('Error creating/updating shared expense:', error);
      toast.error(`Falha ao ${expenseToEdit ? 'atualizar' : 'criar'} despesa compartilhada.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">Descrição</label>
        <Input
          id="description"
          placeholder="Almoço com amigos"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="amount" className="text-sm font-medium">Valor Total</label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="50.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="date" className="text-sm font-medium">Data</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-2">
        <label htmlFor="category" className="text-sm font-medium">Categoria (Opcional)</label>
        <Select onValueChange={setCategory} value={category}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Selecione uma categoria" />
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
      <div className="grid gap-2">
        <label htmlFor="friend" className="text-sm font-medium">Compartilhar com</label>
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
                onClick={() => setSelectedFriend(friend.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200",
                  selectedFriend === friend.id
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
                    selectedFriend === friend.id ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {friend.email}
                  </span>
                </div>
                {selectedFriend === friend.id && (
                  <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        {expenseToEdit ? 'Atualizar Despesa Compartilhada' : 'Registrar Despesa Compartilhada'}
      </Button>
    </form>
  );
}
