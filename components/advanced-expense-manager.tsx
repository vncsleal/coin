"use client"

import { useState, useEffect } from "react"
import { ExpenseSearch } from "@/components/expense-search"
import { ExpenseList } from "@/components/expense-list"
import type { Expense } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function AdvancedExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    try {
      const response = await fetch("/api/expenses")
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
        setFilteredExpenses(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleSearch(filters: {
    query: string
    category: string
    dateFrom: Date | undefined
    dateTo: Date | undefined
  }) {
    let filtered = [...expenses]

    // Filter by search query
    if (filters.query) {
      filtered = filtered.filter((expense) => expense.name.toLowerCase().includes(filters.query.toLowerCase()))
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((expense) => expense.tag === filters.category)
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter((expense) => new Date(expense.date) >= filters.dateFrom!)
    }

    if (filters.dateTo) {
      filtered = filtered.filter((expense) => new Date(expense.date) <= filters.dateTo!)
    }

    setFilteredExpenses(filtered)
  }

  function handleClear() {
    setFilteredExpenses(expenses)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading expenses...</div>
  }

  return (
    <div className="space-y-6">
      <ExpenseSearch onSearch={handleSearch} onClear={handleClear} />

      <div>
        <h3 className="text-lg font-semibold mb-4">
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""} found
        </h3>
        <ExpenseList expenses={filteredExpenses} />
      </div>
    </div>
  )
}
