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

export interface SharedExpense {
  id: string
  description: string
  total_amount: number
  date: string
  category?: string
  paid_by_user_id: string
  shared_with_user_id: string
  status: 'unsettled' | 'settled'
  paid_by_user_name: string
  shared_with_user_name: string
}

export interface SharedIncome {
  id: string
  description: string
  total_amount: number
  date: string
  category?: string
  received_by_user_id: string
  shared_with_user_id: string
  status: 'unsettled' | 'settled'
  received_by_user_name: string
  shared_with_user_name: string
}

export interface SharedIncomesPainelStats {
  totalJointSavings: number;
  myTotalContribution: number;
  friendTotalContribution: number;
}

export interface SharedIncomesAIStats {
  totalJointSavings: number;
  myTotalContribution: number;
  friendTotalContribution: number;
  monthlySharedIncomes: { month: string; total: number }[];
  sharedIncomesByCategory: { category: string; total: number; percentage: number }[];
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

export interface SharedExpensesAIStats {
  totalSpent: number;
  totalPaidByMe: number;
  myDuePortion: number;
  balance: number;
  monthlySharedExpenses: { month: string; total: number }[];
  sharedExpensesByCategory: { category: string; total: number; percentage: number }[];
}

export interface SharedExpensesPainelStats {
  totalSpent: number;
  totalPaidByMe: number;
  myDuePortion: number;
  balance: number;
}
