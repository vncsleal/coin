
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import type { Budget } from "@/lib/types"
import { BudgetForm } from "@/components/budget-form"
import { BudgetOverview } from "@/components/budget-overview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, BarChart3, Target } from "lucide-react"

async function getCurrentBudget(userId: string): Promise<Budget | null> {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const budget = await sql`
    SELECT * FROM budgets 
    WHERE user_id = ${userId} 
    AND month = ${currentMonth} 
    AND year = ${currentYear}
  `

  return budget[0]
    ? {
        ...budget[0],
        amount: Number(budget[0].amount),
      } as Budget
    : null
}

export default async function BudgetPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const currentBudget = await getCurrentBudget(userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orçamento</h1>
        <p className="text-muted-foreground">Defina e acompanhe seu orçamento mensal</p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Definir Orçamento
            
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
        </TabsList>

        {/* Setup Budget Tab */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Definir Orçamento Mensal</CardTitle>
              </div>
              <CardDescription>
                {currentBudget ? "Atualize seu orçamento atual" : "Defina seu orçamento para este mês"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetForm currentBudget={currentBudget} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Visão Geral do Orçamento</CardTitle>
              </div>
              <CardDescription>Acompanhe seus gastos em relação ao seu orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              {!currentBudget ? (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium text-lg">Nenhum orçamento definido ainda</p>
                  <p className="text-sm text-muted-foreground mt-2">Defina seu orçamento mensal na aba "Definir Orçamento" para ver a visão geral.</p>
                </div>
              ) : (
                <BudgetOverview budget={currentBudget} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

