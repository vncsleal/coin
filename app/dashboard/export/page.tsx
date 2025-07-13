
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
        <h1 className="text-3xl font-bold tracking-tight">Exportar Dados</h1>
        <p className="text-muted-foreground">Baixe seus dados de despesas em vários formatos</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Exportar Despesas</CardTitle>
          <CardDescription>Escolha o período e o formato para sua exportação</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportForm />
        </CardContent>
      </Card>
    </div>
  )
}

