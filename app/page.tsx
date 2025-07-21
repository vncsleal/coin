import { SignInButton, SignOutButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Image src="https://l3pden50fc.ufs.sh/f/qVxhWi9olDGtv7HTLkPK2ApQTwchMHEZ8OIegU6XizFlkxf4" alt="Cutia Logo" height={48} width={48} className="h-8 w-8 object-cover" />
        <h1 className="text-lg font-semibold flex items-center gap-2">
          Cutia
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded align-middle ml-1">beta</span>
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <SignInButton mode="modal">
            <Button>Entrar</Button>
          </SignInButton>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <Image src="https://l3pden50fc.ufs.sh/f/qVxhWi9olDGtv7HTLkPK2ApQTwchMHEZ8OIegU6XizFlkxf4" alt="Cutia Logo" width={64} height={64} className="mb-4" />
        <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center gap-2">
          Cutia
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded align-middle ml-1">beta</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Controle Financeiro Inteligente
        </p>
        <SignInButton mode="modal">
          <Button size="lg">Começar</Button>
        </SignInButton>
      </main>
    </div>
  )
}