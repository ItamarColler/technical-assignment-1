export function formatDate(date: unknown): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date as number));
}

export function formatAmount(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
  return currency ? `${formatted} ${currency}` : formatted;
}

export function formatAmountShort(amount: number | null, currency: string | null): string {
  if (amount == null) return "—";
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  return currency ? `${formatted} ${currency}` : formatted;
}

export function truncateHash(hash: string | null): string {
  if (!hash) return "—";
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
