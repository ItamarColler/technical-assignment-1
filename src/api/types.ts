import type { transactions } from "./database/schema";

export type TransactionRow = typeof transactions.$inferSelect;

export type TransactionColumn = keyof TransactionRow;

export type SortOrder = "asc" | "desc";

export type FilterableColumn = "method" | "network" | "buyCurrency" | "sellCurrency";

export interface ParsedQueryParams {
  page: number;
  limit: number;
  sortBy: TransactionColumn;
  sortOrder: SortOrder;
  filters: {
    method?: string;
    network?: string;
    buyCurrency?: string;
    sellCurrency?: string;
  };
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
