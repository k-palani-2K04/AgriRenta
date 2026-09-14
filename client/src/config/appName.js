export const APP_CONFIG = {
  primaryName: "AgriRenta",
  tagline: "Smart Agricultural Equipment & Worker Service Rentals",
  currencySymbol: "₹"
};

/**
 * Formats a numeric amount to Indian Rupee (₹) string
 * @param {number} amount
 * @returns {string} e.g. "₹1,500"
 */
export const formatRupees = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  }).format(amount);
  return `₹${formatted}`;
};
