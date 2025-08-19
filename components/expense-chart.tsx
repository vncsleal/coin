'use client'

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { BarChart } from "lucide-react"

interface ExpenseChartProps {
  data: { date: string; amount: number }[]
  showAmounts?: boolean
}

export function ExpenseChart({ data, showAmounts = true }: ExpenseChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px]">
        <BarChart className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground font-medium text-lg mt-4">Sem dados para exibir</p>
        <p className="text-sm text-muted-foreground mt-2">Adicione despesas para ver o gráfico.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => showAmounts ? formatCurrency(Number(value)) : "••••"}
        />
        <Tooltip formatter={(value) => [showAmounts ? formatCurrency(Number(value)) : "••••", "Valor"]} labelFormatter={(label) => `Data: ${label}`} />
        <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}