
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, List, Receipt } from "lucide-react"

async function getExpenses(userId: string): Promise<Expense[]> {
  const expenses = await sql`
    SELECT * FROM expenses 
    WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC
  `

  return expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
  })) as Expense[]
}

export default async function ExpensesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const expenses = await getExpenses(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
        <p className="text-muted-foreground">Acompanhe e gerencie suas despesas</p>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Adicionar Despesa
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
            
          </TabsTrigger>
        </TabsList>

        {/* Add Expense Tab */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Adicionar Nova Despesa</CardTitle>
              </div>
              <CardDescription>Registre uma nova despesa com detalhes</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm />
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
                  <CardTitle>Despesas Recentes</CardTitle>
                </div>
               
              </div>
              <CardDescription>Seus últimos lançamentos de despesas</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Nenhuma despesa registrada ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">Comece a adicionar suas despesas na aba `&quot;Adicionar Despesa&quot;`.</p>
                </div>
              ) : (
                <ExpenseList expenses={expenses} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

