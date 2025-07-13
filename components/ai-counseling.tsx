"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AICounseling() {
  const [analysis, setAnalysis] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function getAnalysis() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Falha ao obter análise")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao obter análise de IA",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={getAnalysis} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analisando suas finanças...
          </>
        ) : (
          <>
            <Brain className="mr-2 h-4 w-4" />
            Obter Análise Financeira com IA
          </>
        )}
      </Button>

      {analysis && (
        <Card>
          <CardContent className="p-6">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{analysis}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
