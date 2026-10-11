import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to combine Tailwind classes cleanly with conflict resolution.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

import { formatPKR } from '@/Utils/formatCurrency';

/**
 * Format numeric value as Pakistani Rupee (PKR / Rs.).
 */
export function formatCurrency(amount) {
    return formatPKR(amount);
}

export { formatPKR };

/**
 * Format date string.
 */
export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const d = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(d);
    } catch {
        return dateString;
    }
}
