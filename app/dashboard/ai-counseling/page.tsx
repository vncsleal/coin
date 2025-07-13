
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AICounseling } from "@/components/ai-counseling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AICounselingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aconselhamento Financeiro com IA</h1>
        <p className="text-muted-foreground">Receba conselhos financeiros personalizados com base em seus padrões de gastos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise e Aconselhamento Financeiro</CardTitle>
          <CardDescription>
            Nossa IA analisa seus hábitos de consumo e fornece recomendações personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AICounseling />
        </CardContent>
      </Card>
    </div>
  )
}

