export function normalizeAmount(amount: string): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    throw new Error("Invalid amount");
  }
  return value.toFixed(2);
}

export function amountToCents(amount: string): number {
  return Math.round(Number(normalizeAmount(amount)) * 100);
}

export function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}
