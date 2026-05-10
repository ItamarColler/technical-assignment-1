import type { ParsedQueryParams, TransactionColumn } from "../types";
import type { SortEntry, SortOrder } from "./filter/filter.types";

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

  const rawSort = raw.get("sort")?.split(",").filter(Boolean) ?? [];
  const sort: SortEntry[] = [];
  for (const entry of rawSort) {
    const [by, order] = entry.split(":");
    if (!by || !ALLOWED_COLUMNS.has(by as TransactionColumn)) {
      return { ok: false, error: `sort field "${by}" must be one of: ${[...ALLOWED_COLUMNS].join(", ")}` };
    }
    if (order !== "asc" && order !== "desc") {
      return { ok: false, error: `sort order for "${by}" must be asc or desc` };
    }
    sort.push({ by, order: order as SortOrder });
  }
  if (sort.length === 0) sort.push({ by: "date", order: "desc" });

  const searchTerm = (raw.get("searchTerm") ?? "").trim();

  const filters: Record<string, string | undefined> = {};
  for (const [key, value] of raw.entries()) {
    const match = key.match(/^filter\[(.+)\]$/);
    const field = match?.[1];
    if (field && value) filters[field] = value;
  }

  return {
    ok: true,
    params: { page, limit, sort, searchTerm, filters },
  };
}
