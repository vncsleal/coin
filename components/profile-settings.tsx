"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAvailableCurrencies, DEFAULT_CURRENCY, CurrencyCode } from "@/lib/currency"
import { saveUserCurrencyPreference, getUserCurrencyPreference } from "@/lib/client-preferences"
import { useEffect } from "react"
import { Separator } from "@/components/ui/separator"

interface ProfileSettingsProps {
  compact?: boolean
}

export function ProfileSettings({ compact = false }: ProfileSettingsProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY)
  const [notifications, setNotifications] = useState(true)
  const { toast } = useToast()

  const availableCurrencies = getAvailableCurrencies()

  useEffect(() => {
    setCurrency(getUserCurrencyPreference())
  }, [])

  function handleSave() {
    saveUserCurrencyPreference(currency)
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    })
  }

  function handleCurrencyChange(value: string) {
    setCurrency(value as CurrencyCode)
  }

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Moeda Padrão</Label>
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Notificações por Email</Label>
          <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Preferências
        </Button>
      </div>
    )
  }

  // Original full version with theme preview grid
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Moeda Padrão</Label>
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Notificações por Email</Label>
          <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Preferências
        </Button>
      </div>
    </div>
  )
}
