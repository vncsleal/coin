"use client"

import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { availableThemes, getThemeByName } from "@/lib/themes"
import { useEffect, useState } from "react"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-2">
        <Label>Tema</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Carregando..." />
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  const currentTheme = getThemeByName(theme || "light")

  return (
    <div className="space-y-2">
      <Label htmlFor="theme">Tema</Label>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger>
          <SelectValue>
            {currentTheme?.label || "Selecione um tema"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableThemes.map((themeOption) => (
            <SelectItem key={themeOption.name} value={themeOption.name}>
              <div className="flex flex-col">
                <span className="font-medium">{themeOption.label}</span>
                <span className="text-xs text-muted-foreground">{themeOption.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
