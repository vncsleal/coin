"use client"


import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Sparkles, Bot, Send } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function AICounselingModal() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [financialData, setFinancialData] = useState<any>(null)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  // Fetch financial data once per conversation
  const fetchFinancialData = async () => {
    setIsFetchingData(true)
    try {
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counselingType: "general", fetchOnly: true }),
      })
      if (!response.ok) throw new Error("Falha ao obter dados financeiros")
      const data = await response.json()
      setFinancialData(data.financialData)
    } catch (error) {
      toast.error("Falha ao obter dados financeiros")
    } finally {
      setIsFetchingData(false)
    }
  }

  // When modal opens, fetch financial data
  useEffect(() => {
    if (isOpen && !financialData && !isFetchingData) {
      fetchFinancialData()
    }
    if (!isOpen) {
      setMessages([])
      setInput("")
      setFinancialData(null)
    }
  }, [isOpen])

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !financialData) return
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counselingType: "general",
          customPrompt: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          financialData,
        }),
      })
      if (!response.ok) throw new Error("Falha ao obter resposta da IA")
      const data = await response.json()
      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        role: "assistant",
        content: data.analysis,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      toast.error("Falha ao obter resposta da IA")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                <Sparkles className="h-4 w-4 text-white" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>CuTips</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>CuTips</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 flex-1 min-h-[350px] max-h-[400px] overflow-y-auto border rounded-md p-2 bg-background">
          {isFetchingData ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-lg font-semibold">Carregando seus dados financeiros...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <Bot className="h-10 w-10 text-primary mb-2" />
              <span className="text-lg font-semibold">Olá! Sou a CuTips, sua assistente financeira.</span>
              <span className="text-sm text-muted-foreground">Pergunte qualquer coisa sobre suas finanças, despesas, receitas ou orçamento.</span>
            </div>
          ) : null}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg px-3 py-2 mb-1 max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Digitando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 mt-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre suas finanças..."
            disabled={isLoading || isFetchingData || !financialData}
            autoFocus
          />
          <Button type="submit" disabled={isLoading || isFetchingData || !input.trim() || !financialData} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
