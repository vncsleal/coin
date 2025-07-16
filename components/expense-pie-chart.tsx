"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { formatCurrency } from "@/lib/currency"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

interface ExpensePieChartProps {
  data: { tag: string; amount: number }[]
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ tag, percent }) => `${tag} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, props) => [`${formatCurrency(Number(value))}`, props.payload.tag]} />
        <Legend formatter={(value, entry) => `${entry.payload.tag} (${formatCurrency(entry.payload.amount)})`} />
      </PieChart>
    </ResponsiveContainer>
  )
}
