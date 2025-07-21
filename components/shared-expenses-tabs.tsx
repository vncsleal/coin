
'use client';

import { useState, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { PlusCircle, DollarSign, List, BarChart, Trash2, PieChart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseChart } from '@/components/expense-chart';
import { formatCurrency } from '@/lib/currency';
import { SharedExpenseForm } from '@/components/shared-expense-form';
import { EditSharedExpenseModal } from '@/components/EditSharedExpenseModal';
import { deleteSharedExpense, getSharedExpenses, getMonthlySharedExpensesChartData, getSharedExpensesByCategoryData, getSharedPainelStats, updateSharedExpenseStatus, batchSettleSharedExpenses } from '@/app/actions/shared-expenses';
import { Button } from '@/components/ui/button';
import { SharedExpense } from '@/lib/types';


interface SharedExpensesTabsProps {
  painel: ReactNode;
  sharedExpenses: SharedExpense[];
  monthlyChartData: { month: string; total: number }[];
  categoryChartData: { category: string; total: number; percentage: number }[];
  painelStats: {
    totalSpent: number;
    totalPaidByMe: number;
    myDuePortion: number;
    balance: number;
  };
}

export function SharedExpensesTabs({
  painel,
  sharedExpenses: initialSharedExpenses,
  monthlyChartData: initialMonthlyChartData,
  categoryChartData: initialCategoryChartData,
  painelStats: initialPainelStats,
}: SharedExpensesTabsProps) {
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>(initialSharedExpenses);
  const [monthlySharedExpenses, setMonthlySharedExpenses] = useState<{ month: string; total: number }[]>(initialMonthlyChartData);
  const [sharedExpensesByCategory, setSharedExpensesByCategory] = useState<{ category: string; total: number; percentage: number }[]>(initialCategoryChartData);
  const [painelStats, setPainelStats] = useState(initialPainelStats);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const { toast } = useToast();

  const refetchData = async () => {
    const expenses = await getSharedExpenses();
    setSharedExpenses(expenses);
    const monthlyData = await getMonthlySharedExpensesChartData();
    setMonthlySharedExpenses(monthlyData);
    const categoryData = await getSharedExpensesByCategoryData();
    setSharedExpensesByCategory(categoryData);
    const newPainelStats = await getSharedPainelStats();
    setPainelStats(newPainelStats);
  };

  

  const handleToggleStatus = async (id: string, currentStatus: 'unsettled' | 'settled') => {
    const newStatus = currentStatus === 'settled' ? 'unsettled' : 'settled';
    try {
      await updateSharedExpenseStatus(id, newStatus);
      toast({
        title: 'Status da despesa atualizado!',
        description: `A despesa foi marcada como ${newStatus === 'settled' ? 'liquidada' : 'não liquidada'}.`,
      });
      refetchData();
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
      const settledCount = await batchSettleSharedExpenses(selectedExpenses);
      toast({
        title: 'Sucesso',
        description: `${settledCount} despesas liquidadas com sucesso!`,
      });
      setSelectedExpenses([]); // Clear selection
      refetchData();
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
      refetchData();
    } catch (error) {
      console.error('Error deleting shared expense:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir despesa compartilhada.',
        variant: "destructive",
      });
    }
  };

  return (
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
        <TabsTrigger value="painel" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          Painel
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
            <SharedExpenseForm onSave={refetchData} />
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
                <p className="text-sm text-muted-foreground mt-2">Comece a registrar despesas compartilhadas na aba `&quot;Adicionar Despesa&quot;`.</p>
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
                        <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
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
                              e.stopPropagation();
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

      {/* Painel Tab */}
      <TabsContent value="painel">
        {painel}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  
                  <CardTitle>Despesas Compartilhadas Mensais</CardTitle>
                </div>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Visão geral das despesas compartilhadas ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlySharedExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Sem dados para exibir</p>
                  <p className="text-sm text-muted-foreground mt-2">Adicione despesas compartilhadas para ver os gr&aacute;ficos.</p>
                </div>
              ) : (
                <ExpenseChart data={monthlySharedExpenses.map(item => ({ date: item.month, amount: item.total }))} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  
                  <CardTitle>Despesas por Categoria</CardTitle>
                </div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Distribuição das despesas compartilhadas por categoria.</CardDescription>
            </CardHeader>
            <CardContent>
              {sharedExpensesByCategory.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Sem dados para exibir</p>
                  <p className="text-sm text-muted-foreground mt-2">Adicione despesas compartilhadas para ver a tabela.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Porcentagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sharedExpensesByCategory.map((item) => (
                      <TableRow key={item.category}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
