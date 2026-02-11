/**
 * Extracts the first numeric value from a string (e.g., "$300 / $270" -> 300)
 */
export function parsePrice(priceStr: string | null | undefined): number {
  if (!priceStr) return 0;
  // Remove currency symbols and non-numeric chars except decimals
  const match = priceStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}
