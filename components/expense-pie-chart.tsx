'use client'

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { formatCurrency } from "@/lib/currency"
import { PieChart } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

interface ExpensePieChartProps {
  data: { tag: string; amount: number }[]
  showAmounts?: boolean
}

export function ExpensePieChart({ data, showAmounts = true }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <PieChart className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground font-medium text-lg mt-4">Sem dados para exibir</p>
        <p className="text-sm text-muted-foreground mt-2">Adicione despesas para ver o gráfico.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
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
        <Tooltip formatter={(value, name, props) => [showAmounts ? formatCurrency(Number(value)) : "••••••", props.payload.tag]} />
        <Legend formatter={(value, entry) => {
          const payload = entry.payload as { tag: string; amount: number }
          return `${payload.tag} (${showAmounts ? formatCurrency(payload.amount) : "••••••"})`
        }} />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}