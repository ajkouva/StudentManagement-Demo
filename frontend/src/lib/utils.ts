import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to strictly merge tailwind classes without conflict
 * Essential for building dynamic reusable UI components.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
