'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, DollarSign, List, BarChart, ChevronDown, Trash2, Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseChart } from '@/components/expense-chart';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { formatCurrency } from '@/lib/currency';
import { SharedExpenseForm } from '@/components/shared-expense-form';
import { EditSharedExpenseModal } from '@/components/EditSharedExpenseModal';
import { deleteSharedExpense } from '@/app/actions/shared-expenses';


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
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const { toast } = useToast();

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
      toast({
        title: 'Erro',
        description: 'Falha ao carregar amigos.',
        variant: "destructive",
      });
    }
  };

  const fetchSharedExpenses = async () => {
    try {
      const response = await fetch('/api/shared-expenses');
      if (!response.ok) {
        throw new Error('Failed to fetch shared expenses');
      }
      const data = await response.json();
      setSharedExpenses(data.sharedExpenses);
    } catch (error) {
      console.error('Error fetching shared expenses:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar despesas compartilhadas.',
        variant: "destructive",
      });
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
      toast({
        title: 'Erro',
        description: 'Falha ao carregar despesas compartilhadas mensais.',
        variant: "destructive",
      });
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
      toast({
        title: 'Erro',
        description: 'Falha ao carregar despesas compartilhadas por categoria.',
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'unsettled' | 'settled') => {
    const newStatus = currentStatus === 'settled' ? 'unsettled' : 'settled';
    try {
      const response = await fetch('/api/shared-expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }
      toast({
        title: 'Status da despesa atualizado!',
        description: `A despesa foi marcada como ${newStatus === 'settled' ? 'liquidada' : 'não liquidada'}.`,
      });
      fetchSharedExpenses();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar status da despesa.',
        variant: "destructive",
      });
    }
  };

  const handleBatchSettle = async () => {
    if (selectedExpenses.length === 0) {
      toast({
        title: 'Informação',
        description: 'Selecione despesas para liquidar.',
      });
      return;
    }
    try {
      const response = await fetch('/api/shared-expenses/batch-settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedExpenses }),
      });

      if (!response.ok) {
        throw new Error('Failed to batch settle expenses');
      }
      toast({
        title: 'Sucesso',
        description: `${selectedExpenses.length} despesas liquidadas com sucesso!`,
      });
      setSelectedExpenses([]); // Clear selection
      fetchSharedExpenses();
      fetchMonthlySharedExpenses();
      fetchSharedExpensesByCategory();
    } catch (error) {
      console.error('Error batch settling expenses:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao liquidar despesas selecionadas.',
        variant: "destructive",
      });
    }
  };

    const handleDelete = async (id: string) => {
    try {
      await deleteSharedExpense(id);
      toast({
        title: 'Sucesso',
        description: 'Despesa compartilhada excluída com sucesso!',
      });
      fetchSharedExpenses();
      fetchMonthlySharedExpenses();
      fetchSharedExpensesByCategory();
    } catch (error) {
      console.error('Error deleting shared expense:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir despesa compartilhada.',
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !selectedFriend) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: "destructive",
      });
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

      toast({
        title: 'Sucesso',
        description: 'Despesa compartilhada criada com sucesso!',
      });
      setDescription('');
      setAmount('');
      setDate(new Date());
      setCategory('');
      setSelectedFriend('');
      fetchSharedExpenses(); // Refresh the list
    } catch (error) {
      console.error('Error creating shared expense:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar despesa compartilhada.',
        variant: "destructive",
      });
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
              <SharedExpenseForm onSave={() => {
                fetchSharedExpenses();
                fetchMonthlySharedExpenses();
                fetchSharedExpensesByCategory();
              }} />
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Checkbox
                            checked={selectedExpenses.length === sharedExpenses.length && sharedExpenses.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedExpenses(sharedExpenses.map(exp => exp.id));
                              } else {
                                setSelectedExpenses([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Pago Por</TableHead>
                        <TableHead>Compartilhado Com</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-right">Sua Parte</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sharedExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedExpenses.includes(expense.id)}
                              onCheckedChange={(checked) => {
                                setSelectedExpenses(prev =>
                                  checked ? [...prev, expense.id] : prev.filter(id => id !== expense.id)
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>{expense.category || 'Sem Categoria'}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{expense.paid_by_user_name}</TableCell>
                          <TableCell>{expense.shared_with_user_name}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(expense.total_amount)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(expense.total_amount / 2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={expense.status === 'settled' ? 'secondary' : 'default'}
                              size="sm"
                              className="w-[120px]"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleToggleStatus(expense.id, expense.status);
                              }}
                            >
                              {expense.status === 'settled' ? 'Liquidado' : 'Não Liquidado'}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <EditSharedExpenseModal expense={expense} />
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)} className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {selectedExpenses.length > 0 && (
                    <div className="p-4 border-t flex justify-end">
                      <Button onClick={handleBatchSettle}>
                        Marcar como Liquidado ({selectedExpenses.length})
                      </Button>
                    </div>
                  )}
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
