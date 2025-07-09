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

export interface SharedExpense {
  id: number
  name: string
  total_amount: number
  date: string
  tag: string
  created_by: string
  created_at: string
  participants: SharedExpenseParticipant[]
}

export interface SharedExpenseParticipant {
  id: number
  shared_expense_id: number
  user_id: string
  share_amount: number
  created_at: string
}

export interface DashboardStats {
  monthlyExpenditure: number
  dailyAverage: number
  currentBudget: number
  remainingBudget: number
  monthlyExpenses: { date: string; amount: number }[]
  expensesByTag: { tag: string; amount: number }[]
  totalExpensesByTag: { tag: string; amount: number }[]
}
