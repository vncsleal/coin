"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ExpenseForm } from "@/components/expense-form"
import { Pencil } from "lucide-react"
import { Expense } from "@/lib/types"

interface EditExpenseModalProps {
  expense: Expense;
}

export function EditExpenseModal({ expense }: EditExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
        </DialogHeader>
        <ExpenseForm expenseToEdit={expense} onSave={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
