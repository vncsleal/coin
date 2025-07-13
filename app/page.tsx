import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <h1 className="text-lg font-semibold">Rastreador de Despesas</h1>
        <div className="ml-auto flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Entrar</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <Button>Sair</Button>
            </SignOutButton>
          </SignedIn>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Bem-vindo ao Rastreador de Despesas</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Sua solução inteligente para gerenciar finanças.
        </p>
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="lg">Começar</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button size="lg">Ir para o Painel</Button>
          </Link>
        </SignedIn>
      </main>
    </div>
  )
}