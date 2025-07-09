"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserBrowser } from "./user-browser"
import { toast } from "sonner"
import { Plus, X, Users, Calculator, Receipt, DollarSign } from "lucide-react"

const EXPENSE_TAGS = [
  "Food & Dining",
  "Transportation", 
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
]

interface Participant {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  amount?: number
  percentage?: number
}

interface ExpenseItem {
  id: string
  name: string
  amount: number
  participants: string[] // participant IDs
}

type SplitMethod = 'equal' | 'percentage' | 'custom' | 'itemwise'

export function EnhancedSharedExpenseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal')
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    { id: '1', name: '', amount: 0, participants: [] }
  ])
  const [friends, setFriends] = useState<any[]>([])
  const [showUserBrowser, setShowUserBrowser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      const data = await response.json()
      setFriends(data.friends?.filter((f: any) => f.status === 'accepted') || [])
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const addParticipant = (user: any) => {
    const isAlreadyAdded = participants.some(p => p.id === user.id)
    if (!isAlreadyAdded) {
      const newParticipant: Participant = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        amount: 0,
        percentage: 0
      }
      setParticipants([...participants, newParticipant])
      recalculateSplit([...participants, newParticipant])
    }
  }

  const removeParticipant = (participantId: string) => {
    const updated = participants.filter(p => p.id !== participantId)
    setParticipants(updated)
    recalculateSplit(updated)
  }

  const recalculateSplit = (participantList = participants) => {
    if (splitMethod === 'equal' && participantList.length > 0) {
      const amountPerPerson = totalAmount / participantList.length
      setParticipants(participantList.map(p => ({ ...p, amount: amountPerPerson })))
    } else if (splitMethod === 'percentage') {
      // Distribute remaining percentage equally if needed
      const totalPercentage = participantList.reduce((sum, p) => sum + (p.percentage || 0), 0)
      if (totalPercentage < 100 && participantList.length > 0) {
        const remainingPercentage = 100 - totalPercentage
        const equalPercentage = remainingPercentage / participantList.length
        setParticipants(participantList.map(p => ({
          ...p,
          percentage: (p.percentage || 0) + equalPercentage,
          amount: totalAmount * ((p.percentage || 0) + equalPercentage) / 100
        })))
      }
    }
  }

  useEffect(() => {
    recalculateSplit()
  }, [totalAmount, splitMethod])

  const updateParticipantAmount = (participantId: string, amount: number) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, amount } : p
    ))
  }

  const updateParticipantPercentage = (participantId: string, percentage: number) => {
    const updated = participants.map(p => 
      p.id === participantId 
        ? { ...p, percentage, amount: totalAmount * percentage / 100 }
        : p
    )
    setParticipants(updated)
  }

  const addExpenseItem = () => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      participants: []
    }
    setExpenseItems([...expenseItems, newItem])
  }

  const removeExpenseItem = (itemId: string) => {
    setExpenseItems(expenseItems.filter(item => item.id !== itemId))
  }

  const updateExpenseItem = (itemId: string, updates: Partial<ExpenseItem>) => {
    setExpenseItems(expenseItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ))
  }

  const toggleItemParticipant = (itemId: string, participantId: string) => {
    const item = expenseItems.find(i => i.id === itemId)
    if (!item) return

    const isIncluded = item.participants.includes(participantId)
    const updatedParticipants = isIncluded
      ? item.participants.filter(id => id !== participantId)
      : [...item.participants, participantId]

    updateExpenseItem(itemId, { participants: updatedParticipants })
  }

  const calculateItemwiseSplit = () => {
    const participantTotals: { [key: string]: number } = {}
    
    expenseItems.forEach(item => {
      if (item.participants.length > 0) {
        const amountPerParticipant = item.amount / item.participants.length
        item.participants.forEach(participantId => {
          participantTotals[participantId] = (participantTotals[participantId] || 0) + amountPerParticipant
        })
      }
    })

    setParticipants(participants.map(p => ({
      ...p,
      amount: participantTotals[p.id] || 0
    })))
  }

  useEffect(() => {
    if (splitMethod === 'itemwise') {
      calculateItemwiseSplit()
      const newTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0)
      setTotalAmount(newTotal)
    }
  }, [expenseItems, splitMethod])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const expenseData = {
        name: formData.get('name') as string,
        totalAmount,
        date: formData.get('date') as string,
        tag: formData.get('tag') as string,
        participants: participants.map(p => ({
          user_id: p.id,
          share_amount: p.amount || 0
        })),
        splitMethod,
        items: splitMethod === 'itemwise' ? expenseItems : undefined
      }

      const response = await fetch('/api/shared-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      })

      if (response.ok) {
        toast.success('Shared expense created successfully!')
        router.push('/dashboard/shared')
      } else {
        throw new Error('Failed to create shared expense')
      }
    } catch (error) {
      console.error('Error creating shared expense:', error)
      toast.error('Failed to create shared expense')
    } finally {
      setIsLoading(false)
    }
  }

  const totalAssigned = participants.reduce((sum, p) => sum + (p.amount || 0), 0)
  const isBalanced = Math.abs(totalAssigned - totalAmount) < 0.01

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Shared Expense</CardTitle>
          <CardDescription>
            Split expenses with friends using various splitting methods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Dinner at Italian Restaurant"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">Category</Label>
                <Select name="tag" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TAGS.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {splitMethod !== 'itemwise' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={totalAmount || ''}
                    onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Participants Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Participants</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUserBrowser(!showUserBrowser)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Friends
                </Button>
              </div>

              {showUserBrowser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Friends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserBrowser
                      onSelectUser={addParticipant}
                      selectedUsers={participants.map(p => p.id)}
                      showFriendActions={false}
                    />
                  </CardContent>
                </Card>
              )}

              {participants.length > 0 && (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <Card key={participant.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={participant.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {participant.display_name?.charAt(0) || participant.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {participant.display_name || participant.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {participant.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              ${(participant.amount || 0).toFixed(2)}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {participants.length > 0 && (
              <>
                {/* Split Method Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Split Method</h3>
                  <Tabs value={splitMethod} onValueChange={(value) => setSplitMethod(value as SplitMethod)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="equal">
                        <Users className="w-4 h-4 mr-2" />
                        Equal
                      </TabsTrigger>
                      <TabsTrigger value="percentage">
                        <Calculator className="w-4 h-4 mr-2" />
                        Percentage
                      </TabsTrigger>
                      <TabsTrigger value="custom">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Custom
                      </TabsTrigger>
                      <TabsTrigger value="itemwise">
                        <Receipt className="w-4 h-4 mr-2" />
                        By Items
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="equal" className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Amount will be split equally among all participants.
                      </p>
                    </TabsContent>

                    <TabsContent value="percentage" className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Specify percentage for each participant.
                      </p>
                      <div className="space-y-3">
                        {participants.map((participant) => (
                          <div key={participant.id} className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={participant.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {participant.display_name?.charAt(0) || participant.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {participant.display_name || participant.email}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={participant.percentage || ''}
                                onChange={(e) => updateParticipantPercentage(
                                  participant.id,
                                  parseFloat(e.target.value) || 0
                                )}
                                className="w-20"
                              />
                              <span className="text-sm">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Set custom amount for each participant.
                      </p>
                      <div className="space-y-3">
                        {participants.map((participant) => (
                          <div key={participant.id} className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={participant.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {participant.display_name?.charAt(0) || participant.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {participant.display_name || participant.email}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={participant.amount || ''}
                                onChange={(e) => updateParticipantAmount(
                                  participant.id,
                                  parseFloat(e.target.value) || 0
                                )}
                                className="w-24"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="itemwise" className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Split by individual items or services.
                      </p>
                      
                      <div className="space-y-4">
                        {expenseItems.map((item, index) => (
                          <Card key={item.id}>
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Item name"
                                    value={item.name}
                                    onChange={(e) => updateExpenseItem(item.id, { name: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) => updateExpenseItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                                {expenseItems.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExpenseItem(item.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm">Who shares this item?</Label>
                                <div className="flex flex-wrap gap-2">
                                  {participants.map((participant) => (
                                    <Button
                                      key={participant.id}
                                      type="button"
                                      variant={item.participants.includes(participant.id) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => toggleItemParticipant(item.id, participant.id)}
                                    >
                                      {participant.display_name || participant.email}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addExpenseItem}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned:</span>
                        <span className={totalAssigned > totalAmount ? 'text-red-600' : 'text-green-600'}>
                          ${totalAssigned.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difference:</span>
                        <span className={Math.abs(totalAssigned - totalAmount) > 0.01 ? 'text-red-600' : 'text-green-600'}>
                          ${Math.abs(totalAssigned - totalAmount).toFixed(2)}
                        </span>
                      </div>
                      {!isBalanced && (
                        <p className="text-sm text-red-600">
                          The amounts don't add up to the total. Please adjust the split.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || participants.length === 0 || !isBalanced}
            >
              {isLoading ? 'Creating...' : 'Create Shared Expense'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
