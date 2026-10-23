/**
 * Utility for Indian Rupee (INR) currency formatting.
 * Uses official 'en-IN' locale with ₹ symbol and Indian number formatting.
 * E.g., formatINR(1000) => "₹1,000", formatINR(5000) => "₹5,000"
 */
export const MAX_TOURNAMENT_AMOUNT = 5000;

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Ensures tournament amounts never exceed ₹5,000.
 */
export const clampTournamentPrice = (amount: number): number => {
  return Math.min(Math.max(0, amount), MAX_TOURNAMENT_AMOUNT);
};

/**
 * Format a tournament amount strictly capped at ₹5,000 INR.
 */
export const formatTournamentPrice = (amount: number): string => {
  return formatINR(clampTournamentPrice(amount));
};

