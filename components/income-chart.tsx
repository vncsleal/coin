'use client'

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { BarChart } from "lucide-react"

interface IncomeChartProps {
  data: { date: string; amount: number }[]
  showAmounts?: boolean
}

export function IncomeChart({ data, showAmounts = true }: IncomeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px]">
        <BarChart className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground font-medium text-lg mt-4">Sem dados para exibir</p>
        <p className="text-sm text-muted-foreground mt-2">Adicione rendas para ver o gráfico.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => new Date(value).toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: 'UTC' })}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => showAmounts ? formatCurrency(value) : "••••"}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Data</span>
                      <span className="font-bold text-muted-foreground">
                        {new Date(payload[0].payload.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Renda</span>
                      <span className="font-bold">
                        {showAmounts ? formatCurrency(payload[0].value as number) : "••••••"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}