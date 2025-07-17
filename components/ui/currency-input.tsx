'use client'

import * as React from "react"
import CurrencyInputField from "react-currency-input-field"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency"

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'step' | 'onChange'> {
  allowDecimals?: boolean
  onValueChange?: (value: string | undefined, name?: string) => void
  defaultValue?: string | number
  step?: number
  currencyCode?: CurrencyCode
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, onValueChange, currencyCode = DEFAULT_CURRENCY, ...props }, ref) => {
    const currency = CURRENCIES[currencyCode];
    
    return (
      <CurrencyInputField
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onValueChange={onValueChange}
        intlConfig={{ locale: currency.locale, currency: currencyCode }}
        decimalsLimit={currency.decimals}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
