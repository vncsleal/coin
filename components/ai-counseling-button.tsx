"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Sparkles, Loader2 } from "lucide-react"
import MarkdownRenderer from "@/components/ui/markdown-renderer"


export function AICounselingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false) // for user questions
  const [isContextLoading, setIsContextLoading] = useState(false) // for initial context fetch

  // Fetch initial context when modal opens
  const fetchInitialContext = async () => {
    setIsContextLoading(true)
    try {
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counselingType: "general", fetchOnly: true }),
      })
      if (!response.ok) throw new Error("Falha ao obter contexto financeiro")
      // Optionally, you could use this context for the first bot message
    } catch (error) {
      console.error("Erro ao buscar contexto inicial:", error)
    } finally {
      setIsContextLoading(false)
    }
  }

  // Send user message to bot
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return
    setIsLoading(true)
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setInput("")
    try {
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counselingType: "general", customPrompt: userMessage }),
      })
      if (!response.ok) throw new Error("Falha ao obter resposta da Tia Cutia")
      const responseData: any = await response.json()
      setMessages((prev) => [...prev, { role: "bot", content: responseData.analysis }])
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", content: "Desculpe, ocorreu um erro ao buscar resposta." }])
    } finally {
      setIsLoading(false)
    }
  }

  // Open modal and fetch context
  const handleOpen = () => {
    setIsOpen(true)
    setMessages([])
    fetchInitialContext()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleOpen}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tia Cutia</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tia Cutia</DialogTitle>
          <DialogDescription>
            Converse com a Tia Cutia sobre suas finanças. Peça dicas, tire dúvidas ou peça análises personalizadas!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-96 overflow-y-auto flex flex-col gap-2">
          {messages.length === 0 && !isLoading && !isContextLoading && (
            <p className="text-sm text-muted-foreground text-center">Envie uma pergunta para começar a conversa.</p>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Tia Cutia está pensando...</p>
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 pt-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Enviar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}