import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = 'PPP') {
  return format(new Date(date), pattern);
}

export function formatMarks(marks: number) {
  return marks.toFixed(2);
}
