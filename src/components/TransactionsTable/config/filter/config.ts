import type { FilterNode } from "@/api/lib/filter/filter.types";

export const TRANSACTION_FILTERS: FilterNode[] = [
  { key: "method", title: "Method" },
  { key: "network", title: "Network" },
  { key: "buyCurrency", title: "Buy Currency" },
  { key: "sellCurrency", title: "Sell Currency" },
];

export const ADVANCED_FILTERS: FilterNode[] = [
  { key: "feeCurrency", title: "Fee Currency" },
];

export const SEARCH_CONFIG = {
  placeholder: "Search by address, hash, token, comment…",
  debounceMs: 300,
} as const;

export const SORT_CONFIG = {
  defaultSortBy: "date",
  defaultSortOrder: "desc",
} as const;

export const API_CONFIG = {
  url: process.env.BUN_PUBLIC_TRANSACTIONS_URL ?? "/api/transactions",
  filterOptionsUrl:
    process.env.BUN_PUBLIC_TRANSACTIONS_FILTER_OPTIONS_URL ??
    "/api/transactions/filter-options",
  exportUrl:
    process.env.BUN_PUBLIC_TRANSACTIONS_EXPORT_URL ??
    "/api/transactions/export",
} as const;

export const QUERY_CONFIG = {
  ...API_CONFIG,
  defaultParams: {
    page: 1,
    limit: 50,
    sort: [{ by: SORT_CONFIG.defaultSortBy, order: SORT_CONFIG.defaultSortOrder }],
    searchTerm: "",
    filters: [],
  },
};
