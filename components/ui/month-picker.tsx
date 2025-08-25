'use client'

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthPickerProps {
  month: number
  year: number
  path: string
  className?: string
}

const months = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
]

export function MonthPicker({ month: selectedMonth, year: selectedYear, path, className }: MonthPickerProps) {
  const router = useRouter()
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  
  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear

  const handleMonthChange = (month: string, year?: number) => {
    const newYear = year || selectedYear
    router.push(`${path}?month=${month}&year=${newYear}`)
  }

  const handleYearChange = (year: string) => {
    router.push(`${path}?month=${selectedMonth}&year=${year}`)
  }

  const goToCurrentMonth = () => {
    router.push(`${path}?month=${currentMonth}&year=${currentYear}`)
  }

  const goToPreviousMonth = () => {
    let newMonth = selectedMonth - 1
    let newYear = selectedYear
    
    if (newMonth < 1) {
      newMonth = 12
      newYear = selectedYear - 1
    }
    
    handleMonthChange(newMonth.toString(), newYear)
  }

  const goToNextMonth = () => {
    let newMonth = selectedMonth + 1
    let newYear = selectedYear
    
    if (newMonth > 12) {
      newMonth = 1
      newYear = selectedYear + 1
    }
    
    handleMonthChange(newMonth.toString(), newYear)
  }

  // Generate years from 2020 to current year + 2
  const years = React.useMemo(() => {
    const startYear = 2020
    const endYear = currentYear + 2
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [currentYear])

  return (
    <div className={cn("flex flex-col sm:flex-row items-stretch sm:items-center gap-2", className)}>
      {/* Mobile: Month/Year selectors first */}
      <div className="flex items-center gap-2 order-2 sm:order-none">
        <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[80px] h-9 text-sm">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation and current month button */}
      <div className="flex items-center gap-2 order-1 sm:order-none">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-9 w-9 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          className="h-9 w-9 shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Current Month Button */}
        {!isCurrentMonth && (
          <Button
            variant="outline"
            onClick={goToCurrentMonth}
            className="h-9 px-3 text-xs shrink-0 whitespace-nowrap"
            size="sm"
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Este mês
          </Button>
        )}
      </div>
    </div>
  )
}