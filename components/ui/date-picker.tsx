'use client'

import * as React from "react"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChangeAction: (date: Date | undefined) => void
  className?: string
}

function isValidDate(date: Date | undefined): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

export function DatePicker({ value, onChangeAction, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [displayValue, setDisplayValue] = React.useState("")
  const [month, setMonth] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    if (isValidDate(value)) {
      setDisplayValue(format(value, "dd/MM/yyyy", { locale: ptBR }))
      setMonth(value)
    } else {
      setDisplayValue("")
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value
    setDisplayValue(newDisplayValue)

    const parsedDate = parse(newDisplayValue, "dd/MM/yyyy", new Date(), { locale: ptBR })
    if (isValidDate(parsedDate)) {
      onChangeAction(parsedDate)
      setMonth(parsedDate)
    } else {
      onChangeAction(undefined)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    onChangeAction(date)
    if (isValidDate(date)) {
      setDisplayValue(format(date, "dd/MM/yyyy", { locale: ptBR }))
    }
    setOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        value={displayValue}
        placeholder="dd/MM/yyyy"
        className="bg-background pr-10"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            aria-label="Selecione a data"
          >
            <CalendarIcon className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            fromYear={1960}
            toYear={2030}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
