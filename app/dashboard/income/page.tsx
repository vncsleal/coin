'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { PlusCircle, List, DollarSign } from "lucide-react";

const incomeSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  date: z.string().min(1, "A data é obrigatória."),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface Income extends IncomeFormValues {
  id: number;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      name: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    },
  });

  async function fetchIncomes() {
    try {
      const response = await fetch("/api/incomes");
      if (!response.ok) throw new Error("Falha ao buscar rendas.");
      const data = await response.json();
      setIncomes(data.incomes);
    } catch (error) {
      toast.error("Não foi possível carregar as rendas.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchIncomes();
  }, []);

  const onSubmit = async (values: IncomeFormValues) => {
    try {
      const response = await fetch("/api/incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Falha ao adicionar renda.");

      const { income } = await response.json();
      setIncomes([income, ...incomes]);
      toast.success("Renda adicionada com sucesso!");
      form.reset({
        name: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("Não foi possível adicionar a renda.");
    }
  };

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
            Adicionar Renda
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Nome da Renda</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Salário, Freelance" {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">Valor</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Renda
                  </Button>
                </form>
              </Form>
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
                  <p className="text-sm text-muted-foreground mt-2">Comece a adicionar suas fontes de renda na aba "Adicionar Renda".</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
