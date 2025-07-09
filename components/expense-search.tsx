"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ExpenseSearchProps {
  onSearch: (filters: {
    query: string
    category: string
    dateFrom: Date | undefined
    dateTo: Date | undefined
  }) => void
  onClear: () => void
}

const EXPENSE_TAGS = [
  "All Categories",
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
]

export function ExpenseSearch({ onSearch, onClear }: ExpenseSearchProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  function handleSearch() {
    onSearch({
      query,
      category: category === "All Categories" ? "" : category,
      dateFrom,
      dateTo,
    })
  }

  function handleClear() {
    setQuery("")
    setCategory("All Categories")
    setDateFrom(undefined)
    setDateTo(undefined)
    onClear()
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Search & Filter Expenses</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Input placeholder="Search expenses..." value={query} onChange={(e) => setQuery(e.target.value)} />
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
                {dateFrom ? format(dateFrom, "PPP") : "From date"}
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
                {dateTo ? format(dateTo, "PPP") : "To date"}
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
          Search
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  )
}
