/**
 * Currency formatting utilities for Indian Rupee (₹)
 * Uses en-IN locale for proper Indian numbering system (e.g., 1,50,000)
 */

/**
 * Format a number as Indian Rupee currency
 * @param amount - The amount to format
 * @returns Formatted currency string with ₹ symbol and Indian numbering
 * 
 * @example
 * formatCurrency(150000) // "₹1,50,000.00"
 * formatCurrency(1234.5) // "₹1,234.50"
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format a number as currency without the symbol (just the number with Indian formatting)
 * @param amount - The amount to format
 * @returns Formatted number string with Indian numbering
 * 
 * @example
 * formatAmount(150000) // "1,50,000.00"
 */
export function formatAmount(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format currency for display in tables with +/- prefix for income/expense
 * @param amount - The amount to format
 * @param type - 'income' or 'expense'
 * @returns Formatted currency with appropriate prefix
 * 
 * @example
 * formatTransactionAmount(5000, 'income') // "+₹5,000.00"
 * formatTransactionAmount(3000, 'expense') // "-₹3,000.00"
 */
export function formatTransactionAmount(
  amount: number | string,
  type: 'income' | 'expense'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = formatCurrency(numAmount);
  const prefix = type === 'income' ? '+' : '-';
  
  return `${prefix}${formatted}`;
}

