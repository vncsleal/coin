'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { availableThemes } from '@/lib/themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const themes = availableThemes.map(theme => theme.name)
  
  return (
    <NextThemesProvider 
      themes={themes}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
