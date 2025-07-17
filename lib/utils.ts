import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse a date string and return a valid Date object or null
 * @param dateStr - The date string to parse
 * @returns Valid Date object or null if parsing fails
 */
export function safeDateParse(
  dateStr: string | null | undefined
): Date | null {
  if (!dateStr) return null;

  try {
    let parsedDate: Date;

    // Handle different date formats
    if (dateStr.includes("T")) {
      // ISO format with time
      parsedDate = new Date(dateStr);
    } else {
      // Assume YYYY-MM-DD format and add time to prevent timezone issues
      parsedDate = new Date(dateStr + "T00:00:00");
    }

    // Check if the date is valid
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  } catch (error) {
    console.warn("Failed to parse date:", dateStr, error);
  }

  return null;
}

/**
 * Format a date safely for form submission (YYYY-MM-DD format)
 * @param date - Date object to format
 * @returns Formatted date string or current date if invalid
 */
export function safeFormatDateForSubmission(
  date: Date | null | undefined
): string {
  if (!date || isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return date.toISOString().split("T")[0];
}

/**
 * Format date for display in Portuguese locale
 * @param date - Date to format
 * @param formatStr - Format string (default: "PPP")
 * @returns Formatted date string in Portuguese
 */
export function formatDateBR(
  date: Date | null | undefined,
  formatStr: string = "PPP"
): string {
  const { format } = require("date-fns");
  const { ptBR } = require("date-fns/locale");

  if (!date || isNaN(date.getTime())) {
    return "Data Inválida";
  }

  return format(date, formatStr, { locale: ptBR });
}

export function formatDate(dateString: string) {
  const timeZone = 'UTC';
  const zonedDate = toZonedTime(dateString, timeZone);
  return format(zonedDate, 'dd/MM/yyyy');
}