import type { transactions } from "./database/schema";
import type { SortEntry } from "./lib/filter/filter.types";

export type TransactionRow = typeof transactions.$inferSelect;

export type TransactionColumn = keyof TransactionRow;

export type { SortOrder } from "./lib/filter/filter.types";

export interface ParsedQueryParams {
  page: number;
  limit: number;
  sort: SortEntry[];
  searchTerm: string;
  filters: Record<string, string | undefined>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
