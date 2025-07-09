"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addExpense } from "@/app/actions/expenses"

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

export function ExpenseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      await addExpense(formData)
      toast({
        title: "Success",
        description: "Expense added successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Expense Name</Label>
        <Input id="name" name="name" placeholder="Enter expense name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
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

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  )
}
