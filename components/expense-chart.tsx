"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/currency"

interface ExpenseChartProps {
  data: { date: string; amount: number }[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(Number(value))}
        />
        <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} labelFormatter={(label) => `Date: ${label}`} />
        <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
