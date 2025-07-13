import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart3, PieChart, Users, Brain } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">Rastreador de Despesas Inteligente</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Assuma o controle de suas finanças com insights alimentados por IA, despesas compartilhadas e acompanhamento orçamentário abrangente.
          </p>

          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-3">
                Começar <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Ir para o Painel <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Análises Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Visualize seus padrões de gastos com gráficos interativos.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PieChart className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Controle de Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Defina orçamentos mensais e acompanhe seu progresso com atualizações em tempo real.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Despesas Compartilhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Divida contas e acompanhe despesas compartilhadas com amigos e familiares.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Aconselhamento por IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Obtenha aconselhamento financeiro personalizado e insights com o poder da IA.</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Recursos que Você Vai Adorar</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Exportar Dados</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Baixe suas despesas como arquivos CSV para análise externa.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Insights em Tempo Real</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Obtenha feedback instantâneo sobre seus hábitos de consumo e adesão ao orçamento.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Seguro e Privado</h3>
              <p className="text-gray-600 dark:text-gray-300">Seus dados financeiros são criptografados e armazenados com segurança.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
