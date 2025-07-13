
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AdvancedExpenseManager } from "@/components/advanced-expense-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdvancedExpensesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento Avançado de Despesas</h1>
        <p className="text-muted-foreground">Pesquise, filtre e gerencie suas despesas com ferramentas avançadas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Despesas</CardTitle>
          <CardDescription>Recursos avançados de pesquisa e filtragem</CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedExpenseManager />
        </CardContent>
      </Card>
    </div>
  )
}

