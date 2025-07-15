"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/currency"

interface IncomeChartProps {
  data: { date: string; amount: number }[]
}

export function IncomeChart({ data }: IncomeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
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
          tickFormatter={(value) => formatCurrency(value)}
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
                        {formatCurrency(payload[0].value as number)}
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
      </BarChart>
    </ResponsiveContainer>
  )
}
