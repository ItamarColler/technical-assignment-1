import type { FilterNode } from "@/components/DataTable/types";

/** Defines which columns are filterable and their display labels. */
export const TRANSACTION_FILTERS: FilterNode[] = [
  { key: "method", label: "Method" },
  { key: "network", label: "Network" },
  { key: "buyCurrency", label: "Buy Currency" },
  { key: "sellCurrency", label: "Sell Currency" },
];

/** Search configuration for the transactions table. */
export const SEARCH_CONFIG = {
  placeholder: "Search by hash, address…",
  debounceMs: 300,
} as const;

export const SORT_CONFIG = {
  defaultSortBy: "date",
  defaultSortOrder: "desc",
} as const;

export const API_CONFIG = {
  url: process.env.BUN_PUBLIC_TRANSACTIONS_URL ?? "/api/transactions",
  filterOptionsUrl: process.env.BUN_PUBLIC_TRANSACTIONS_FILTER_OPTIONS_URL ?? "/api/transactions/filter-options",
} as const;
