
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { EnhancedSharedExpenseForm } from "@/components/shared/enhanced-shared-expense-form"
import { SharedExpenseList } from "@/components/shared-expense-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SharedExpensesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Despesas Compartilhadas</h1>
        <p className="text-muted-foreground">Divida despesas com amigos e familiares</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Criar Despesa Compartilhada</CardTitle>
            <CardDescription>Adicione despesas com divisão inteligente - igual, porcentagem, valores personalizados ou por item</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedSharedExpenseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suas Despesas Compartilhadas</CardTitle>
            <CardDescription>Despesas compartilhadas recentes das quais você faz parte</CardDescription>
          </CardHeader>
          <CardContent>
            <SharedExpenseList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

