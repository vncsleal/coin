// Currency configuration and utilities
export const CURRENCIES = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    locale: 'pt-BR',
    decimals: 2
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimals: 2
  }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// Default currency
export const DEFAULT_CURRENCY: CurrencyCode = 'BRL';

/**
 * Format a number as currency using the specified currency code
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
  showSymbol: boolean = true
): string {
  const currency = CURRENCIES[currencyCode];
  
  if (showSymbol) {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);
  } else {
    return new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);
  }
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  return CURRENCIES[currencyCode].symbol;
}

/**
 * Get currency name for a given currency code
 */
export function getCurrencyName(currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  return CURRENCIES[currencyCode].name;
}

/**
 * Parse a currency string to number (removing currency symbols and formatting)
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const cleanValue = value.replace(/[^\d.,-]/g, '');
  
  // Handle different decimal separators (comma vs period)
  const normalizedValue = cleanValue.replace(',', '.');
  
  return parseFloat(normalizedValue) || 0;
}

/**
 * Format currency input (for form inputs)
 */
export function formatCurrencyInput(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY
): string {
  return formatCurrency(amount, currencyCode, false);
}

/**
 * Get all available currencies for dropdowns
 */
export function getAvailableCurrencies() {
  return Object.entries(CURRENCIES).map(([code, currency]) => ({
    code: code as CurrencyCode,
    name: currency.name,
    symbol: currency.symbol,
    displayName: `${currency.name} (${currency.symbol})`
  }));
}
