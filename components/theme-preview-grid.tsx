"use client"

import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { availableThemes, type Theme } from "@/lib/themes"
import { Check } from "lucide-react"

interface ThemePreviewProps {
  theme: Theme
  isSelected: boolean
  onSelect: () => void
}

function ThemePreview({ theme, isSelected, onSelect }: ThemePreviewProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{theme.label}</CardTitle>
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </div>
        <CardDescription className="text-xs">{theme.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${theme.className} p-3 rounded-md space-y-2 bg-background border`}>
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <div className="h-3 w-3 rounded-full bg-secondary"></div>
            <div className="h-3 w-3 rounded-full bg-accent"></div>
          </div>
          <div className="h-2 w-full bg-muted rounded"></div>
          <div className="h-2 w-3/4 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ThemePreviewGrid() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Temas Disponíveis</h3>
        <p className="text-sm text-muted-foreground">
          Escolha um tema para personalizar a aparência do aplicativo
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableThemes.map((themeOption) => (
          <ThemePreview
            key={themeOption.name}
            theme={themeOption}
            isSelected={theme === themeOption.name}
            onSelect={() => setTheme(themeOption.name)}
          />
        ))}
      </div>
    </div>
  )
}
