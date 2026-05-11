const toDate = (date: Date | number): Date =>
  date instanceof Date ? date : new Date(date);

export const formatDate = (date: Date | number): string => {
  const d = toDate(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatDateShort = (date: Date | number): string => {
  const d = toDate(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(2);
  return `${day}/${month}/${year}`;
};

export const formatDateVerbose = (date: Date | number): string =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDate(date));

export const formatAmount = (
  amount: number | null,
  currency: string | null,
): string => {
  if (amount == null) return "—";
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export const formatAmountCompact = (amount: number | null): string => {
  if (amount == null) return "—";
  const abs = Math.abs(amount);
  const fmt = (n: number, digits: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  if (abs >= 1_000_000_000_000) return fmt(amount / 1_000_000_000_000, 2) + "T";
  if (abs >= 1_000_000_000) return fmt(amount / 1_000_000_000, 2) + "B";
  if (abs >= 1_000_000) return fmt(amount / 1_000_000, 2) + "M";
  if (abs >= 1_000) return fmt(amount / 1_000, 2) + "K";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
};

export const truncateHash = (hash: string | null): string => {
  if (!hash) return "—";
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
};
