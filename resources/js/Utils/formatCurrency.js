/**
 * Centralized Currency Formatter Utility for Pakistani Rupee (PKR / Rs.)
 */

export function formatPKR(amount) {
    const num = Number(amount) || 0;
    return `Rs. ${num.toLocaleString('en-PK')}`;
}

export function formatCurrency(amount) {
    return formatPKR(amount);
}

export default formatPKR;
