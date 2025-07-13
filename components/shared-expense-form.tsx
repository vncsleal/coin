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
  "Alimentação e Refeições",
  "Transporte",
  "Compras",
  "Entretenimento",
  "Contas e Utilidades",
  "Saúde",
  "Educação",
  "Viagem",
  "Outros",
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
        title: "Sucesso",
        description: "Despesa compartilhada criada com sucesso",
      })
      setParticipants([""])
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar despesa compartilhada",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Despesa</Label>
        <Input id="name" name="name" placeholder="Digite o nome da despesa" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor Total</Label>
        <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag">Categoria</Label>
        <Select name="tag" required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
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
        <Label htmlFor="date">Data</Label>
        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
      </div>

      <div className="space-y-2">
        <Label>Participantes (Endereços de Email)</Label>
        {participants.map((email, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="participante@exemplo.com"
              value={email}
              onChange={(e) => updateParticipant(index, e.target.value)}
            />
            {participants.length > 1 && (
              <Button type="button" variant="outline" onClick={() => removeParticipant(index)}>
                Remover
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addParticipant}>
          Adicionar Participante
        </Button>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Criando..." : "Criar Despesa Compartilhada"}
      </Button>
    </form>
  )
}
