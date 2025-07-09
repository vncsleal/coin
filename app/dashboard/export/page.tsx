import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ExportForm } from "@/components/export-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ExportPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground">Download your expense data in various formats</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Export Expenses</CardTitle>
          <CardDescription>Choose date range and format for your export</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportForm />
        </CardContent>
      </Card>
    </div>
  )
}
