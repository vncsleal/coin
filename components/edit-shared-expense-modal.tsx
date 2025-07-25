"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { SharedExpense } from "@/lib/types"
import { SharedExpenseForm } from "./shared-expense-form"

interface EditSharedExpenseModalProps {
  expense: SharedExpense;
}

export function EditSharedExpenseModal({ expense }: EditSharedExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Despesa Compartilhada</DialogTitle>
        </DialogHeader>
        <SharedExpenseForm expenseToEdit={expense} onSave={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
