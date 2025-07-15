"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Brain, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AICounselingModalProps {
  counselingType: "monthly_income" | "net_balance" | "monthly_incomes_chart" | "monthly_expenditure" | "daily_average" | "current_budget" | "remaining_budget" | "monthly_expenses_chart" | "expenses_by_category_chart" | "total_expenses_by_category_chart";
  data: any; // This will be the relevant data for the counseling type
}

export function AICounselingModal({ counselingType, data }: AICounselingModalProps) {
  const [analysis, setAnalysis] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const getCounselingPrompt = () => {
    switch (counselingType) {
      case "monthly_expenditure":
        return `Analyze my monthly expenditure of ${data.monthlyExpenditure} and provide tips to save money. Compare it with previous months if data is available: ${JSON.stringify(data.monthlyExpenses)}. Also, provide insights on expense by category: ${JSON.stringify(data.expensesByTag)}.`;
      case "daily_average":
        return `Analyze my daily average spending of ${data.dailyAverage} and provide insights. Can I continue spending at this rate? What would my expected monthly expense be this way? My current monthly expenditure is ${data.monthlyExpenditure} and my budget is ${data.currentBudget}.`;
      case "current_budget":
        return `Analyze my current budget of ${data.currentBudget} and provide tips for effective budget management. My monthly expenditure is ${data.monthlyExpenditure}.`;
      case "remaining_budget":
        return `Analyze my remaining budget of ${data.remainingBudget} and provide advice on how to manage it for the rest of the month. My current monthly expenditure is ${data.monthlyExpenditure} and my budget is ${data.currentBudget}.`;
      case "monthly_expenses_chart":
        return `Analyze my monthly expenses data: ${JSON.stringify(data.monthlyExpenses)}. Provide insights on trends, anomalies, and tips for better spending habits based on this historical data.`;
      case "expenses_by_category_chart":
        return `Analyze my expenses by category for the current month: ${JSON.stringify(data.expensesByTag)}. Provide insights on which categories I spend the most on and tips to reduce spending in those areas.`;
      case "total_expenses_by_category_chart":
        return `Analyze my total expenses by category across all time: ${JSON.stringify(data.totalExpensesByTag)}. Provide long-term spending insights and strategies for financial improvement based on these categories.`;
      default:
        return "Provide general financial counseling based on my expense data.";
    }
  };

  const getAnalysis = async () => {
    setIsLoading(true)
    setAnalysis("") // Clear previous analysis

    try {
      const prompt = getCounselingPrompt();
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Falha ao obter análise da IA")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error fetching AI analysis:", error)
      toast.error("Falha ao obter análise da IA")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => { setIsOpen(true); getAnalysis(); }}>
                <Sparkles className="h-4 w-4 text-white" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Aconselhamento com IA</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Aconselhamento Financeiro com IA</DialogTitle>
          <DialogDescription>
            Receba insights e dicas personalizadas com base nos seus dados financeiros.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Analisando suas finanças...</p>
            </div>
          ) : analysis ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
              {analysis}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">Nenhuma análise disponível.</p>
          )}
        </div>
        <Button onClick={getAnalysis} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Gerar Nova Análise
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
