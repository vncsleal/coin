"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Search, List } from "lucide-react"
import { ExpenseList } from "@/components/expense-list"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Receipt } from "lucide-react"
import type { Expense } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExpenseListClientProps {
  initialExpenses: Expense[]
}

export function ExpenseListClient({ initialExpenses }: ExpenseListClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    setExpenses(initialExpenses)
  }, [initialExpenses])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearchQuery) {
      params.set("search", debouncedSearchQuery)
    } else {
      params.delete("search")
    }
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory)
    } else {
      params.delete("category")
    }
    router.replace(`${window.location.pathname}?${params.toString()}`)
  }, [debouncedSearchQuery, selectedCategory, searchParams, router])

  const uniqueCategories = Array.from(new Set(initialExpenses.map(expense => expense.tag)))

  const filteredExpenses = expenses.filter((expense) => {
    const searchLower = debouncedSearchQuery.toLowerCase()
    const matchesSearch = (
      expense.name.toLowerCase().includes(searchLower) ||
      expense.tag.toLowerCase().includes(searchLower)
    )
    const matchesCategory = selectedCategory === "all" || expense.tag === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Despesas Recentes</CardTitle>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar despesas..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>Seus últimos lançamentos de despesas</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-medium text-lg">Carregando despesas...</p>
          </div>
        ) : filteredExpenses.length === 0 && (debouncedSearchQuery || selectedCategory !== "all") ? (
          <div className="text-center py-12">
            <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium text-lg">Nenhuma despesa encontrada para "{debouncedSearchQuery}" na categoria "{selectedCategory === "all" ? "Todas" : selectedCategory}"</p>
            <p className="text-sm text-muted-foreground mt-2">Tente ajustar sua pesquisa ou filtros.</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium text-lg">Nenhuma despesa registrada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">Comece a adicionar suas despesas na aba `&quot;Adicionar Despesa&quot;`.</p>
          </div>
        ) : (
          <ExpenseList expenses={filteredExpenses} />
        )}
      </CardContent>
    </Card>
  )
}