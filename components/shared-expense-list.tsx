"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedExpenseCard } from "@/components/shared/enhanced-expense-card"
import { BulkOperations } from "@/components/shared/bulk-operations"
import { Filter, Search } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"

interface EnhancedSharedExpense {
  id: number;
  name: string;
  total_amount: number;
  date: string;
  tag: string;
  created_by: string;
  split_method?: string;
  items?: any[];
  created_at: string;
  updated_at: string;
  participants: Array<{
    id: number;
    user_id: string;
    share_amount: number;
    settlement_status: string;
    paid_amount: number;
  }>;
}

export function SharedExpenseList() {
  const [sharedExpenses, setSharedExpenses] = useState<EnhancedSharedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showBulkMode, setShowBulkMode] = useState(false)

  useEffect(() => {
    fetchSharedExpenses()
  }, [])

  const fetchSharedExpenses = async () => {
    try {
      const response = await fetch("/api/shared-expenses")
      if (response.ok) {
        const data = await response.json()
        setSharedExpenses(data)
      }
    } catch (error) {
      console.error("Failed to fetch shared expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter expenses based on search and status
  const filteredExpenses = sharedExpenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.tag.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (statusFilter === "all") return true
    
    const isFullySettled = expense.participants.every(p => p.settlement_status === 'confirmed')
    const hasPending = expense.participants.some(p => p.settlement_status === 'pending')
    
    switch (statusFilter) {
      case "settled": return isFullySettled
      case "pending": return hasPending
      case "active": return !isFullySettled
      default: return true
    }
  })

  // Bulk operation handlers
  const handleBulkSettle = async (expenseIds: number[]) => {
    // Implement bulk settle logic
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  }

  const handleBulkRemind = async (expenseIds: number[]) => {
    // Implement bulk remind logic
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  }

  const handleBulkDelete = async (expenseIds: number[]) => {
    // Implement bulk delete logic
    setSharedExpenses(prev => prev.filter(exp => !expenseIds.includes(exp.id)))
  }

  const handleBulkExport = async (expenseIds: number[]) => {
    // Implement bulk export logic
    const selectedData = sharedExpenses.filter(exp => expenseIds.includes(exp.id))
    const csv = generateCSV(selectedData)
    downloadCSV(csv, 'shared-expenses.csv')
  }

  const handleBulkMarkSettled = async (expenseIds: number[]) => {
    // Implement bulk mark settled logic
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    await fetchSharedExpenses() // Refresh data
  }

  const generateCSV = (expenses: EnhancedSharedExpense[]) => {
    const headers = ['Name', 'Amount', 'Date', 'Tag', 'Participants', 'Status']
    const rows = expenses.map(exp => [
      exp.name,
      exp.total_amount.toString(),
      exp.date,
      exp.tag,
      exp.participants.length.toString(),
      exp.participants.every(p => p.settlement_status === 'confirmed') ? 'Settled' : 'Active'
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const handleExpenseSelect = (expenseId: number, selected: boolean) => {
    setSelectedExpenses(prev => 
      selected 
        ? [...prev, expenseId]
        : prev.filter(id => id !== expenseId)
    )
  }

  const clearSelection = () => {
    setSelectedExpenses([])
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando despesas compartilhadas...</div>
  }

  if (sharedExpenses.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma despesa compartilhada ainda</div>
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Suas Despesas Compartilhadas</CardTitle>
              <CardDescription>Gerencie e acompanhe suas despesas compartilhadas</CardDescription>
            </div>
            <Button 
              variant={showBulkMode ? "default" : "outline"}
              onClick={() => {
                setShowBulkMode(!showBulkMode)
                if (showBulkMode) clearSelection()
              }}
            >
              {showBulkMode ? "Sair do Modo em Massa" : "Ações em Massa"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar despesas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Despesas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="pending">Pagamento Pendente</SelectItem>
                <SelectItem value="settled">Totalmente Liquidadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando {filteredExpenses.length} de {sharedExpenses.length} despesas
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {showBulkMode && (
        <BulkOperations
          selectedCount={selectedExpenses.length}
          selectedExpenses={selectedExpenses}
          clearSelectionAction={clearSelection}
          bulkSettleAction={handleBulkSettle}
          bulkRemindAction={handleBulkRemind}
          bulkDeleteAction={handleBulkDelete}
          bulkExportAction={handleBulkExport}
          bulkMarkSettledAction={handleBulkMarkSettled}
        />
      )}

      {/* Expense List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredExpenses.map((expense) => (
          <EnhancedExpenseCard
            key={expense.id}
            expense={expense}
            isSelected={selectedExpenses.includes(expense.id)}
            onSelect={(selected) => handleExpenseSelect(expense.id, selected)}
            onUpdate={fetchSharedExpenses}
            onDelete={(id) => {
              setSharedExpenses(prev => prev.filter(exp => exp.id !== id))
              toast.success('Despesa excluída')
            }}
            onDuplicate={(expense) => {
              // Handle expense duplication
              toast.success('Despesa duplicada')
            }}
            onSettle={async (id) => {
              // Handle quick settle
              await new Promise(resolve => setTimeout(resolve, 1000))
              await fetchSharedExpenses()
            }}
            onRemind={async (id) => {
              // Handle send reminder
              await new Promise(resolve => setTimeout(resolve, 1000))
              toast.success('Lembrete enviado')
            }}
            showActions={true}
            showSelection={showBulkMode}
          />
        ))}
      </div>
    </div>
  )
}
