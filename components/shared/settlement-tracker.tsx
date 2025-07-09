"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { CheckCircle, Clock, DollarSign, Users, Bell, History } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface Settlement {
  id: number
  shared_expense_id: number
  participant_id: string
  paid_amount: number
  paid_at?: string
  confirmed_by?: string
  status: 'pending' | 'paid' | 'confirmed'
  participant_name?: string
  participant_email?: string
  participant_avatar?: string
  share_amount: number
}

interface SettlementSummaryProps {
  expenseId: number
  expenseName: string
  totalAmount: number
  onSettlementUpdate?: () => void
}

export function SettlementTracker({ expenseId, expenseName, totalAmount, onSettlementUpdate }: SettlementSummaryProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    fetchSettlements()
  }, [expenseId])

  const fetchSettlements = async () => {
    try {
      const response = await fetch(`/api/shared-expenses/${expenseId}/settlements`)
      const data = await response.json()
      setSettlements(data.settlements || [])
    } catch (error) {
      console.error('Error fetching settlements:', error)
      toast.error('Failed to load settlement information')
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (settlementId: number, amount: number) => {
    try {
      const response = await fetch(`/api/settlements/${settlementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'paid', 
          paid_amount: amount,
          paid_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        await fetchSettlements()
        onSettlementUpdate?.()
        toast.success('Payment marked as completed')
      } else {
        throw new Error('Failed to update settlement')
      }
    } catch (error) {
      console.error('Error updating settlement:', error)
      toast.error('Failed to update payment status')
    }
  }

  const confirmPayment = async (settlementId: number) => {
    try {
      const response = await fetch(`/api/settlements/${settlementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'confirmed'
        })
      })

      if (response.ok) {
        await fetchSettlements()
        onSettlementUpdate?.()
        toast.success('Payment confirmed')
      } else {
        throw new Error('Failed to confirm settlement')
      }
    } catch (error) {
      console.error('Error confirming settlement:', error)
      toast.error('Failed to confirm payment')
    }
  }

  const sendReminder = async (participantId: string) => {
    try {
      const response = await fetch(`/api/settlements/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          expense_id: expenseId,
          participant_id: participantId
        })
      })

      if (response.ok) {
        toast.success('Reminder sent successfully')
      } else {
        throw new Error('Failed to send reminder')
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast.error('Failed to send reminder')
    }
  }

  const totalPaid = settlements.reduce((sum, s) => sum + (s.paid_amount || 0), 0)
  const totalOwed = settlements.reduce((sum, s) => sum + s.share_amount, 0)
  const progressPercentage = totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0

  const pendingSettlements = settlements.filter(s => s.status === 'pending')
  const paidSettlements = settlements.filter(s => s.status === 'paid')
  const confirmedSettlements = settlements.filter(s => s.status === 'confirmed')

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Settlement Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{expenseName}</CardTitle>
              <CardDescription>Settlement Progress</CardDescription>
            </div>
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Settlement History</DialogTitle>
                  <DialogDescription>
                    Payment history for {expenseName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...confirmedSettlements, ...paidSettlements].map((settlement) => (
                    <div key={settlement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={settlement.participant_avatar} />
                          <AvatarFallback className="text-xs">
                            {settlement.participant_name?.charAt(0) || settlement.participant_email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {settlement.participant_name || settlement.participant_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {settlement.paid_at && new Date(settlement.paid_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(settlement.paid_amount)}</p>
                        <Badge variant={settlement.status === 'confirmed' ? 'default' : 'secondary'}>
                          {settlement.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {[...confirmedSettlements, ...paidSettlements].length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No payment history yet.
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOwed - totalPaid)}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalOwed)}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {pendingSettlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              Pending Payments ({pendingSettlements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingSettlements.map((settlement) => (
              <div key={settlement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={settlement.participant_avatar} />
                    <AvatarFallback>
                      {settlement.participant_name?.charAt(0) || settlement.participant_email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {settlement.participant_name || settlement.participant_email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Owes {formatCurrency(settlement.share_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendReminder(settlement.participant_id)}
                  >
                    <Bell className="w-4 h-4 mr-1" />
                    Remind
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => markAsPaid(settlement.id, settlement.share_amount)}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Mark Paid
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payments to Confirm */}
      {paidSettlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
              Awaiting Confirmation ({paidSettlements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paidSettlements.map((settlement) => (
              <div key={settlement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={settlement.participant_avatar} />
                    <AvatarFallback>
                      {settlement.participant_name?.charAt(0) || settlement.participant_email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {settlement.participant_name || settlement.participant_email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Paid {formatCurrency(settlement.paid_amount)} • {settlement.paid_at && new Date(settlement.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => confirmPayment(settlement.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirm
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Payments */}
      {confirmedSettlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Completed ({confirmedSettlements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {confirmedSettlements.slice(0, 3).map((settlement) => (
              <div key={settlement.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={settlement.participant_avatar} />
                    <AvatarFallback>
                      {settlement.participant_name?.charAt(0) || settlement.participant_email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {settlement.participant_name || settlement.participant_email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(settlement.paid_amount)} • {settlement.paid_at && new Date(settlement.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </Badge>
              </div>
            ))}
            {confirmedSettlements.length > 3 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowHistory(true)}
              >
                View All {confirmedSettlements.length} Completed Payments
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
