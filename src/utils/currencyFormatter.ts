/**
 * Formats a number as Indian Rupees currency
 * 
 * @param amount The amount to format
 * @param showSymbol Whether to include the ₹ symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

/**
 * Returns just the Rupee symbol ₹
 */
export const currencySymbol = '₹';

export default {
  formatCurrency,
  currencySymbol
}; 