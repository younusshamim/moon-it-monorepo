import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, resolving Tailwind conflicts (later wins).
 * The single styling helper for the design system — see the shadcn styling rules.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
