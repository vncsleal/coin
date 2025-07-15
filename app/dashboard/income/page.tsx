import { IncomeManager } from "@/components/income-manager"

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rendas</h1>
        <p className="text-muted-foreground">Adicione e gerencie suas fontes de renda.</p>
      </div>
      <IncomeManager />
    </div>
  )
}
