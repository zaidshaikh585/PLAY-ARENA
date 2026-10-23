/**
 * Utility for Indian Rupee (INR) currency formatting.
 * Uses official 'en-IN' locale with ₹ symbol and Indian number formatting (lakhs, crores).
 * E.g., formatINR(1000) => "₹1,000", formatINR(5000000) => "₹50,00,000"
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
