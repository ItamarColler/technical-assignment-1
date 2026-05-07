import type { ParsedQueryParams, SortOrder, TransactionColumn } from "../types";

const ALLOWED_COLUMNS = new Set<TransactionColumn>([
  "id", "method", "buyAmount", "buyCurrency", "buyToken",
  "sellAmount", "sellCurrency", "sellToken",
  "feeAmount", "feeCurrency", "feeToken",
  "date", "txHash", "blockHeight", "network",
  "smartContract", "senderAddress", "receiverAddress", "comments",
]);

export type ValidationResult =
  | { ok: true; params: ParsedQueryParams }
  | { ok: false; error: string };

export function parseQueryParams(url: URL): ValidationResult {
  const raw = url.searchParams;

  const page = parseInt(raw.get("page") ?? "1", 10);
  if (isNaN(page) || page < 1) return { ok: false, error: "page must be a positive integer" };

  const rawLimit = parseInt(raw.get("limit") ?? "20", 10);
  if (isNaN(rawLimit) || rawLimit < 1) return { ok: false, error: "limit must be a positive integer" };
  const limit = Math.min(rawLimit, 100);

  const rawSortBy = raw.get("sortBy") ?? "date";
  if (!ALLOWED_COLUMNS.has(rawSortBy as TransactionColumn)) {
    return { ok: false, error: `sortBy must be one of: ${[...ALLOWED_COLUMNS].join(", ")}` };
  }
  const sortBy = rawSortBy as TransactionColumn;

  const rawSortOrder = raw.get("sortOrder") ?? "desc";
  if (rawSortOrder !== "asc" && rawSortOrder !== "desc") {
    return { ok: false, error: "sortOrder must be asc or desc" };
  }
  const sortOrder = rawSortOrder as SortOrder;

  return {
    ok: true,
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      filters: {
        method: raw.get("filter[method]") ?? undefined,
        network: raw.get("filter[network]") ?? undefined,
        buyCurrency: raw.get("filter[buyCurrency]") ?? undefined,
        sellCurrency: raw.get("filter[sellCurrency]") ?? undefined,
      },
    },
  };
}
