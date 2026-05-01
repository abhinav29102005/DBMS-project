import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge.
 * Solves conflicts like 'p-4 p-2' -> 'p-2'.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or object.
 */
export function formatDate(date: string | Date, pattern = 'PPP') {
  return format(new Date(date), pattern);
}

/**
 * Formats marks to a fixed decimal.
 */
export function formatMarks(marks: number) {
  return marks.toFixed(2);
}
