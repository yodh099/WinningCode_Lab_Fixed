import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine and merge class names with Tailwind CSS conflict resolution
 * 
 * This utility combines multiple class names and intelligently merges
 * Tailwind CSS classes to resolve conflicts. It uses:
 * - clsx: For conditional class name combination
 * - tailwind-merge: For resolving Tailwind class conflicts
 * 
 * Example:
 * ```tsx
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (px-4 overrides px-2)
 * cn('text-red-500', isError && 'text-blue-500') // Conditional classes
 * ```
 * 
 * @param inputs - Class values to combine (strings, objects, arrays)
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
