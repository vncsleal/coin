"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createSharedExpense } from "@/app/actions/shared-expenses"

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

export function SharedExpenseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState([""])
  const router = useRouter()
  const { toast } = useToast()

  function addParticipant() {
    setParticipants([...participants, ""])
  }

  function removeParticipant(index: number) {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  function updateParticipant(index: number, email: string) {
    const updated = [...participants]
    updated[index] = email
    setParticipants(updated)
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      // Add participants to form data
      participants.forEach((email, index) => {
        if (email.trim()) {
          formData.append(`participant_${index}`, email.trim())
        }
      })

      await createSharedExpense(formData)
      toast({
        title: "Success",
        description: "Shared expense created successfully",
      })
      setParticipants([""])
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shared expense",
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
        <Label htmlFor="amount">Total Amount</Label>
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

      <div className="space-y-2">
        <Label>Participants (Email addresses)</Label>
        {participants.map((email, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="participant@example.com"
              value={email}
              onChange={(e) => updateParticipant(index, e.target.value)}
            />
            {participants.length > 1 && (
              <Button type="button" variant="outline" onClick={() => removeParticipant(index)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addParticipant}>
          Add Participant
        </Button>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating..." : "Create Shared Expense"}
      </Button>
    </form>
  )
}
