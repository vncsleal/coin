
'use client';

import { useState} from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { PlusCircle, DollarSign, List, BarChart, Trash2, PieChart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncomeChart } from '@/components/income-chart';
import { formatCurrency } from '@/lib/currency';
import { SharedIncomeForm } from '@/components/shared-income-form';
import { EditSharedIncomeModal } from '@/components/EditSharedIncomeModal';
import { deleteSharedIncome, getSharedIncomes, getMonthlySharedIncomesChartData, getSharedIncomesByCategoryData, getSharedPainelStats, updateSharedIncomeStatus, batchSettleSharedIncomes } from '@/app/actions/shared-incomes';
import { Button } from '@/components/ui/button';
import { SharedIncome, SharedIncomesPainelStats} from '@/lib/types';

import { SharedIncomesPainel } from '@/components/shared-incomes-painel';

interface SharedIncomesTabsProps {
  sharedIncomes: SharedIncome[];
  monthlyChartData: { month: string; total: number }[];
  categoryChartData: { category: string; total: number; percentage: number }[];
  painelStats: {
    totalJointSavings: number;
    myTotalContribution: number;
    friendTotalContribution: number;
  };
}

export function SharedIncomesTabs({
  sharedIncomes: initialSharedIncomes,
  monthlyChartData: initialMonthlyChartData,
  categoryChartData: initialCategoryChartData,
  painelStats: initialPainelStats,
}: SharedIncomesTabsProps) {
  const [sharedIncomes, setSharedIncomes] = useState<SharedIncome[]>(initialSharedIncomes);
  const [monthlySharedIncomes, setMonthlySharedIncomes] = useState<{ month: string; total: number }[]>(initialMonthlyChartData);
  const [sharedIncomesByCategory, setSharedIncomesByCategory] = useState<{ category: string; total: number; percentage: number }[]>(initialCategoryChartData);
  const [painelStats, setPainelStats] = useState<SharedIncomesPainelStats>(initialPainelStats);
  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([]);
  const { toast } = useToast();

  const refetchData = async () => {
    const incomes = await getSharedIncomes();
    setSharedIncomes(incomes);
    const monthlyData = await getMonthlySharedIncomesChartData();
    setMonthlySharedIncomes(monthlyData);
    const categoryData = await getSharedIncomesByCategoryData();
    setSharedIncomesByCategory(categoryData);
    const newPainelStats = await getSharedPainelStats();
    setPainelStats(newPainelStats);
  };

  const handleToggleStatus = async (id: string, currentStatus: 'unsettled' | 'settled') => {
    const newStatus = currentStatus === 'settled' ? 'unsettled' : 'settled';
    try {
      await updateSharedIncomeStatus(id, newStatus);
      toast({
        title: 'Status da renda atualizado!',
        description: `A renda foi marcada como ${newStatus === 'settled' ? 'liquidada' : 'não liquidada'}.`,
      });
      refetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar status da renda.',
        variant: "destructive",
      });
    }
  };

  const handleBatchSettle = async () => {
    if (selectedIncomes.length === 0) {
      toast({
        title: 'Informação',
        description: 'Selecione rendas para liquidar.',
      });
      return;
    }
    try {
      const settledCount = await batchSettleSharedIncomes(selectedIncomes);
      toast({
        title: 'Sucesso',
        description: `${settledCount} rendas liquidadas com sucesso!`,
      });
      setSelectedIncomes([]); // Clear selection
      refetchData();
    } catch (error) {
      console.error('Error batch settling incomes:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao liquidar rendas selecionadas.',
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSharedIncome(id);
      toast({
        title: 'Sucesso',
        description: 'Renda compartilhada excluída com sucesso!',
      });
      refetchData();
    } catch (error) {
      console.error('Error deleting shared income:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir renda compartilhada.',
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="add" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="add" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Adicionar Renda
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

      {/* Add Income Tab */}
      <TabsContent value="add">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Registrar Nova Renda Compartilhada</CardTitle>
            </div>
            <CardDescription>Adicione uma renda que será dividida igualmente com um amigo.</CardDescription>
          </CardHeader>
          <CardContent>
            <SharedIncomeForm onSave={refetchData} />
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
                <CardTitle>Minhas Rendas Compartilhadas</CardTitle>
              </div>
            </div>
            <CardDescription>Todas as rendas que você compartilhou ou que foram compartilhadas com você.</CardDescription>
          </CardHeader>
          <CardContent>
            {sharedIncomes.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium text-lg">Nenhuma renda compartilhada ainda</p>
                <p className="text-sm text-muted-foreground mt-2">Comece a registrar rendas compartilhadas na aba `&quot;Adicionar Renda&quot;`.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox
                          checked={selectedIncomes.length === sharedIncomes.length && sharedIncomes.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIncomes(sharedIncomes.map(inc => inc.id));
                            } else {
                              setSelectedIncomes([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Recebido Por</TableHead>
                      <TableHead>Compartilhado Com</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Sua Parte</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sharedIncomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIncomes.includes(income.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIncomes(prev =>
                                checked ? [...prev, income.id] : prev.filter(id => id !== income.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{income.description}</TableCell>
                        <TableCell>{income.category || 'Sem Categoria'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(income.date)}</TableCell>
                        <TableCell>{income.received_by_user_name}</TableCell>
                        <TableCell>{income.shared_with_user_name}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(income.total_amount)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(income.total_amount / 2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={income.status === 'settled' ? 'secondary' : 'default'}
                            size="sm"
                            className="w-[120px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(income.id, income.status);
                            }}
                          >
                            {income.status === 'settled' ? 'Liquidado' : 'Não Liquidado'}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <EditSharedIncomeModal income={income} />
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(income.id)} className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {selectedIncomes.length > 0 && (
                  <div className="p-4 border-t flex justify-end">
                    <Button onClick={handleBatchSettle}>
                      Marcar como Liquidado ({selectedIncomes.length})
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
        <SharedIncomesPainel painelStats={painelStats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Rendas Compartilhadas Mensais</CardTitle>
                </div>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Visão geral das rendas compartilhadas ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlySharedIncomes.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Sem dados para exibir</p>
                  <p className="text-sm text-muted-foreground mt-2">Adicione rendas compartilhadas para ver os gr&aacute;ficos.</p>
                </div>
              ) : (
                <IncomeChart data={monthlySharedIncomes.map(item => ({ date: item.month, amount: item.total }))} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Rendas por Categoria</CardTitle>
                </div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Distribuição das rendas compartilhadas por categoria.</CardDescription>
            </CardHeader>
            <CardContent>
              {sharedIncomesByCategory.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Sem dados para exibir</p>
                  <p className="text-sm text-muted-foreground mt-2">Adicione rendas compartilhadas para ver a tabela.</p>
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
                    {sharedIncomesByCategory.map((item) => (
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
