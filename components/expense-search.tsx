"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ExpenseSearchProps {
  onSearchAction: (filters: {
    query: string
    category: string
    dateFrom: Date | undefined
    dateTo: Date | undefined
  }) => void
  onClearAction: () => void
}

const EXPENSE_TAGS = [
  "Todas as Categorias",
  "Alimentação e Refeições",
  "Transporte",
  "Compras",
  "Entretenimento",
  "Contas e Utilidades",
  "Saúde",
  "Educação",
  "Viagem",
  "Outros",
]

export function ExpenseSearch({ onSearchAction, onClearAction }: ExpenseSearchProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Todas as Categorias")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  function handleSearch() {
    onSearchAction({
      query,
      category: category === "Todas as Categorias" ? "" : category,
      dateFrom,
      dateTo,
    })
  }

  function handleClear() {
    setQuery("")
    setCategory("Todas as Categorias")
    setDateFrom(undefined)
    setDateTo(undefined)
    onClearAction()
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Pesquisar e Filtrar Despesas</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Input placeholder="Pesquisar despesas..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP", { locale: ptBR }) : "Data inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP", { locale: ptBR }) : "Data final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} size="sm">
          <Search className="mr-2 h-4 w-4" />
          Pesquisar
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm">
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  )
}
