"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import MarkdownRenderer from "@/components/ui/markdown-renderer"

import { DashboardStats, SharedExpensesAIStats, SharedExpensesPainelStats } from "@/lib/types"

interface AICounselingModalProps {
  counselingType: 
    | "monthly_income" 
    | "net_balance" 
    | "monthly_incomes_chart" 
    | "monthly_expenditure" 
    | "daily_average" 
    | "current_budget" 
    | "remaining_budget" 
    | "monthly_expenses_chart" 
    | "expenses_by_category_chart" 
    | "total_expenses_by_category_chart"
    | "monthly_shared_expenditure"
    | "shared_expenses_painel_summary"
    | "shared_expenses_monthly_chart"
    | "shared_expenses_category_table";
  data: DashboardStats | SharedExpensesAIStats | SharedExpensesPainelStats; 
}

export function AICounselingModal({ counselingType, data }: AICounselingModalProps) {
  const [analysis, setAnalysis] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const getAnalysis = async () => {
    setIsLoading(true)
    setAnalysis("") // Clear previous analysis


    try {
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          counselingType: counselingType,
          data: data 
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao obter análise da IA")
      }

      // Parse and log response
      const responseData: any = await response.json()
      setAnalysis(responseData.analysis)
    } catch (error) {
      console.error("Modal error fetching AI analysis:", error)
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
            <p>Dicas da Cutia</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dicas da Cutia</DialogTitle>
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
            <div className="max-h-96 overflow-y-auto">
              <MarkdownRenderer content={analysis} />
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
              
              Gerar Nova Análise
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
