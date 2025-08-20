import { SignInButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { TrendingUp, PieChart, Target, Brain } from "lucide-react"

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex min-h-screen">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 lg:py-24">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAECD8]">
                <Image 
                  src="/cutia-logo.png" 
                  alt="Cutia Logo" 
                  width={24} 
                  height={24} 
                  className="h-6 w-6 object-cover" 
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Cutia</h1>
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">beta</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Seu Dinheiro, Sob Controle
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Deixe a Cutia te ajudar a conquistar seus sonhos financeiros. Vamos juntos transformar seus gastos em crescimento e suas metas em realidade.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Acompanhe cada real que entra e sai</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <PieChart className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Descubra para onde seu dinheiro está indo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Crie metas e veja seu progresso crescer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Receba conselhos personalizados da Cutia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            {/* Mobile logo */}
            <div className="flex flex-col items-center mb-8 lg:hidden">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#FAECD8] mb-4">
                <Image 
                  src="/cutia-logo.png" 
                  alt="Cutia Logo" 
                  width={32} 
                  height={32} 
                  className="h-8 w-8 object-cover" 
                />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold flex items-center gap-2 justify-center">
                  Cutia
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">beta</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Sua parceira financeira</p>
              </div>
            </div>

            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight">Que bom te ver aqui!</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vamos cuidar das suas finanças juntos
                  </p>
                </div>

                <SignInButton mode="modal">
                  <Button className="w-full h-11 text-base font-medium" size="lg">
                    Vamos começar!
                  </Button>
                </SignInButton>

                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    Primeira vez aqui?{" "}
                    <SignInButton mode="modal">
                      <button className="font-medium text-primary hover:underline">
                        A Cutia te dá as boas-vindas
                      </button>
                    </SignInButton>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Ao continuar, você concorda com nossos{" "}
                <a href="#" className="underline hover:text-foreground">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="#" className="underline hover:text-foreground">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}