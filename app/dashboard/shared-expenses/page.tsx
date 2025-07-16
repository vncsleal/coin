'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, DollarSign, List, BarChart, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseChart } from '@/components/expense-chart';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { formatCurrency } from '@/lib/currency';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EXPENSE_TAGS } from '@/lib/constants';

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

export default function SharedExpensesPage() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>([]);
  const [monthlySharedExpenses, setMonthlySharedExpenses] = useState<{ month: string; total: number }[]>([]);
  const [sharedExpensesByCategory, setSharedExpensesByCategory] = useState<{ category: string; total: number }[]>([]);

  useEffect(() => {
    fetchFriends();
    fetchSharedExpenses();
    fetchMonthlySharedExpenses();
    fetchSharedExpensesByCategory();
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

  const fetchSharedExpenses = async () => {
    try {
      const response = await fetch('/api/shared-expenses/list');
      if (!response.ok) {
        throw new Error('Failed to fetch shared expenses');
      }
      const data = await response.json();
      setSharedExpenses(data.sharedExpenses);
    } catch (error) {
      console.error('Error fetching shared expenses:', error);
      toast.error('Failed to load shared expenses.');
    }
  };

  const fetchMonthlySharedExpenses = async () => {
    try {
      const response = await fetch('/api/shared-expenses/charts?type=monthly_shared_expenses');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly shared expenses');
      }
      const data = await response.json();
      setMonthlySharedExpenses(data.chartData.map((item: any) => ({ ...item, total: Number(item.total) })));
    } catch (error) {
      console.error('Error fetching monthly shared expenses:', error);
      toast.error('Failed to load monthly shared expenses.');
    }
  };

  const fetchSharedExpensesByCategory = async () => {
    try {
      const response = await fetch('/api/shared-expenses/charts?type=shared_expenses_by_category');
      if (!response.ok) {
        throw new Error('Failed to fetch shared expenses by category');
      }
      const data = await response.json();
      setSharedExpensesByCategory(data.chartData.map((item: any) => ({ ...item, total: Number(item.total) })));
    } catch (error) {
      console.error('Error fetching shared expenses by category:', error);
      toast.error('Failed to load shared expenses by category.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !selectedFriend) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await fetch('/api/shared-expenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          total_amount: parseFloat(amount),
          date: date.toISOString().split('T')[0],
          category: category || null,
          shared_with_user_id: selectedFriend,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create shared expense');
      }

      toast.success('Despesa compartilhada criada com sucesso!');
      setDescription('');
      setAmount('');
      setDate(new Date());
      setCategory('');
      setSelectedFriend('');
      fetchSharedExpenses(); // Refresh the list
    } catch (error) {
      console.error('Error creating shared expense:', error);
      toast.error('Falha ao criar despesa compartilhada.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Despesas Compartilhadas</h1>
        <p className="text-muted-foreground">Gerencie despesas divididas com seus amigos.</p>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Adicionar Despesa
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
            
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
        </TabsList>

        {/* Add Expense Tab */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Registrar Nova Despesa Compartilhada</CardTitle>
              </div>
              <CardDescription>Adicione uma despesa que será dividida igualmente com um amigo.</CardDescription>
            </CardHeader>
            <CardContent>
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
                  
                  Registrar Despesa Compartilhada
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Minhas Despesas Compartilhadas</CardTitle>
                </div>
                
              </div>
              <CardDescription>Todas as despesas que você compartilhou ou que foram compartilhadas com você.</CardDescription>
            </CardHeader>
            <CardContent>
              {sharedExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Nenhuma despesa compartilhada ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">Comece a registrar despesas compartilhadas na aba "Adicionar Despesa".</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sharedExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(expense.date), 'PPP')} - {expense.category || 'Sem Categoria'}</p>
                        <p className="text-sm text-muted-foreground">Pago por: {expense.paid_by_user_name}</p>
                        <p className="text-sm text-muted-foreground">Compartilhado com: {expense.shared_with_user_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(expense.total_amount)}</p>
                        <p className="text-sm text-muted-foreground">Sua parte: {formatCurrency(expense.total_amount / 2)}</p>
                        <Badge variant={expense.status === 'settled' ? 'default' : 'destructive'} className={expense.status === 'settled' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}>
                          {expense.status === 'settled' ? 'Liquidado' : 'Não Liquidado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Despesas Compartilhadas Mensais</CardTitle>
                </div>
                <CardDescription>Visão geral das despesas compartilhadas ao longo do tempo.</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlySharedExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium text-lg">Sem dados para exibir</p>
                    <p className="text-sm text-muted-foreground mt-2">Adicione despesas compartilhadas para ver os gráficos.</p>
                  </div>
                ) : (
                  <ExpenseChart data={monthlySharedExpenses.map(item => ({ date: item.month, amount: item.total }))} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Despesas Compartilhadas por Categoria</CardTitle>
                </div>
                <CardDescription>Distribuição das despesas compartilhadas por categoria.</CardDescription>
              </CardHeader>
              <CardContent>
                {sharedExpensesByCategory.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium text-lg">Sem dados para exibir</p>
                    <p className="text-sm text-muted-foreground mt-2">Adicione despesas compartilhadas para ver os gráficos.</p>
                  </div>
                ) : (
                  <ExpensePieChart data={sharedExpensesByCategory.map(item => ({ tag: item.category || 'Outros', amount: item.total }))} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
