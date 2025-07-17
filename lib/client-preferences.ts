import { CurrencyCode, DEFAULT_CURRENCY } from './currency';

const CURRENCY_PREF_KEY = 'user_currency_preference';

/**
 * Saves the user's currency preference to localStorage.
 * @param currencyCode The currency code to save.
 */
export function saveUserCurrencyPreference(currencyCode: CurrencyCode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENCY_PREF_KEY, currencyCode);
  }
}

/**
 * Retrieves the user's currency preference from localStorage.
 * Defaults to BRL if not found.
 * @returns The saved currency code or the default currency.
 */
export function getUserCurrencyPreference(): CurrencyCode {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem(CURRENCY_PREF_KEY) as CurrencyCode) || DEFAULT_CURRENCY;
  }
  return DEFAULT_CURRENCY;
}
