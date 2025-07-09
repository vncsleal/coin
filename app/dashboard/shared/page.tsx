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
        <h1 className="text-3xl font-bold tracking-tight">Shared Expenses</h1>
        <p className="text-muted-foreground">Split expenses with friends and family</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Shared Expense</CardTitle>
            <CardDescription>Add expenses with smart splitting - equal, percentage, custom amounts, or item-wise</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedSharedExpenseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Shared Expenses</CardTitle>
            <CardDescription>Recent shared expenses you&apos;re part of</CardDescription>
          </CardHeader>
          <CardContent>
            <SharedExpenseList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
