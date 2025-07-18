"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2,  Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import MarkdownRenderer from "@/components/ui/markdown-renderer"

export function AICounseling() {
  const [analysis, setAnalysis] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [reportType, setReportType] = useState<string>("monthly")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const { toast } = useToast()

  async function getAnalysis() {
    setIsLoading(true)
    setAnalysis("")

    let startDate, endDate
    const today = new Date()

    switch (reportType) {
      case "weekly":
        startDate = new Date(today.setDate(today.getDate() - 7))
        endDate = new Date()
        break
      case "monthly":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case "custom":
        if (!dateRange?.from || !dateRange?.to) {
          toast({
            title: "Erro",
            description: "Por favor, selecione um período para o relatório personalizado.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        startDate = dateRange.from
        endDate = dateRange.to
        break
    }

    try {
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counselingType: "report",
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao gerar relatório")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório de IA",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Relatório Financeiro</CardTitle>
          <CardDescription>Selecione o tipo de relatório que você deseja gerar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de Relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Relatório Semanal</SelectItem>
                <SelectItem value="monthly">Relatório Mensal</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {reportType === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal sm:w-auto"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={ptBR}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <Button onClick={getAnalysis} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                
                Gerar Relatório com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-semibold">Sua análise financeira está sendo preparada...</p>
          <p className="text-muted-foreground">Isso pode levar alguns instantes. Estamos compilando seus dados e gerando insights.</p>
        </div>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório Financeiro Detalhado</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <MarkdownRenderer content={analysis} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
