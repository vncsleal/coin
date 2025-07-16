
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AICounseling } from "@/components/ai-counseling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, FileText, Zap } from "lucide-react"

export default async function AIReportsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios com IA</h1>
          <p className="text-muted-foreground">Obtenha insights inteligentes e relatórios financeiros personalizados</p>
        </div>
       
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium">Relatórios Detalhados</p>
            <p className="text-sm text-muted-foreground">Análises completas dos seus dados</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
            <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium">Insights Personalizados</p>
            <p className="text-sm text-muted-foreground">Recomendações baseadas em IA</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium">Ações Práticas</p>
            <p className="text-sm text-muted-foreground">Dicas acionáveis para economizar</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Análise Financeira com IA</CardTitle>
              <CardDescription>
                Nossa IA analisa seus padrões de gastos e gera relatórios detalhados com recomendações personalizadas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AICounseling />
        </CardContent>
      </Card>
    </div>
  )
}

