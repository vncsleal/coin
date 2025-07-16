export interface Expense {
  id: number
  user_id: string
  name: string
  tag: string
  amount: number
  date: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: number
  user_id: string
  amount: number
  month: number
  year: number
  created_at: string
  updated_at: string
}

export interface Income {
  id: number
  user_id: string
  name: string
  amount: number
  date: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  monthlyIncome: number
  monthlyExpenditure: number
  monthlySharedExpenditure: number
  dailyAverage: number
  currentBudget: number
  remainingBudget: number
  netBalance: number
  monthlyIncomes: { date: string; amount: number }[]
  monthlyExpenses: { date: string; amount: number }[]
  expensesByTag: { tag: string; amount: number }[]
  totalExpensesByTag: { tag: string; amount: number }[]
}
