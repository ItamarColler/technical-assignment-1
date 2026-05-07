import type { ReactNode } from "react";

export interface FilterNode {
  key: string;
  label: string;
  value?: string;
}

export type SortOrder = "asc" | "desc";

export interface FilterDTO {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
  searchTerm: string;
  filters: FilterNode[];
}

export interface Cell<T> {
  key: keyof T & string;
  label: string;
  mobileHidden?: boolean;
  width?: string;
  render: (row: T) => ReactNode;
}
