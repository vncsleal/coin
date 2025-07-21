'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { PlusCircle, List, DollarSign, Trash2 } from "lucide-react";
import { Income } from "@/lib/types";
import { IncomeForm } from "@/components/income-form";
import { EditIncomeModal } from "@/components/EditIncomeModal";
import { deleteIncome, getIncomes } from "@/app/actions/incomes";

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchIncomes() {
    try {
      const data = await getIncomes();
      setIncomes(data);
    } catch {
      toast.error("Não foi possível carregar as rendas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchIncomes();
  }, []);

    async function handleDelete(id: number) {
    try {
      await deleteIncome(id);
      toast.success("Renda excluída com sucesso!");
      fetchIncomes(); // Refresh the list
    } catch  {
      toast.error("Não foi possível excluir a renda.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rendas</h1>
        <p className="text-muted-foreground">Adicione e gerencie suas fontes de renda.</p>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar Renda</span>
            <span className="sm:hidden">Adicionar</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
            
          </TabsTrigger>
        </TabsList>

        {/* Add Income Tab */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Adicionar Nova Renda</CardTitle>
              </div>
              <CardDescription>Preencha os detalhes da sua nova fonte de renda.</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeForm onSave={fetchIncomes} />
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
                  <CardTitle>Rendas Registradas</CardTitle>
                </div>
                
              </div>
              <CardDescription>Sua lista de rendas para o período selecionado.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando rendas...</p>
                </div>
              ) : incomes.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Nenhuma renda registrada ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">Comece a adicionar suas fontes de renda na aba `&quot;Adicionar Renda&quot;`.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomes.map((income) => (
                          <TableRow key={income.id} className="hover:bg-accent/50 transition-colors">
                            <TableCell className="font-medium">{income.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(income.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(income.amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <EditIncomeModal income={income} />
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
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {incomes.map((income) => (
                      <Card key={income.id} className="p-4">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{income.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(income.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <EditIncomeModal income={income} />
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(income.id)} className="h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Valor</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(income.amount)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}