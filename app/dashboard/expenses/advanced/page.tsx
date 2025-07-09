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
        <h1 className="text-3xl font-bold tracking-tight">Advanced Expense Management</h1>
        <p className="text-muted-foreground">Search, filter, and manage your expenses with advanced tools</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Manager</CardTitle>
          <CardDescription>Advanced search and filtering capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedExpenseManager />
        </CardContent>
      </Card>
    </div>
  )
}
