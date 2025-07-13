"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Download } from "lucide-react"

export function ExportForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `despesas-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Sucesso",
        description: "Despesas exportadas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao exportar despesas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Data de Início</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Data de Término</Label>
        <Input id="endDate" name="endDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Formato de Exportação</Label>
        <Select name="format" defaultValue="csv">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        {isLoading ? "Exportando..." : "Exportar Dados"}
      </Button>
    </form>
  )
}
