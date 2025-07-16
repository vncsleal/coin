"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { Income } from "@/lib/types"
import { IncomeForm } from "./income-form"

interface EditIncomeModalProps {
  income: Income;
}

export function EditIncomeModal({ income }: EditIncomeModalProps) {
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
          <DialogTitle>Editar Renda</DialogTitle>
        </DialogHeader>
        <IncomeForm incomeToEdit={income} onSave={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
