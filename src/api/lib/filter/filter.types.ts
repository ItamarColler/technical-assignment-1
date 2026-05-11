/************************* Filter config  ************************/
export type FilterOperator = "eq" | "gte" | "lte" | "like";

export interface FilterNode {
  key: string;
  title: string;
  value?: string;
  operator?: FilterOperator;
  children?: FilterNode[];
}

export interface FilterConfig {
  key: string;
  title: string;
}

export interface SearchConfig {
  searchArrayFields?: string[];
  searchFields?: string[];
  searchObjectsArrayFields?: string[];
  searchObjectFields?: QueryObjectFieldMap;
}

export interface FilterFields {
  key: string;
  type: string;
  children?: FilterFields[];
}

export interface QueryObjectFieldMap {
  [key: string]: string[];
}

export interface FilterData {
  filters: FilterConfig[];
  inventoryFields?: { [key: string]: string };
  documentFields?: { [key: string]: FilterFields };
  arrayFields?: { [key: string]: string };
  searchFields?: string[];
  sortFields?: { [key: string]: string };
  fetchExternalInventory?: (
    params?: unknown | null,
  ) => Promise<{ [key: string]: unknown[] }>;
}

interface queryParams<Q> {
  inventoryQueryParams?: Q;
}

export interface FilterStructureParams<D, Q> extends queryParams<Q> {
  selectedFilter: FilterNode[];
  data: D[];
  searchTerm?: string;
  filterSwitch?: string;
}

export type SortOrder = "asc" | "desc";

export interface SortEntry {
  by: string;
  order: SortOrder;
}

export interface FilterDTO {
  page: number;
  limit: number;
  sort: SortEntry[];
  searchTerm: string;
  filters: FilterNode[];
}

export interface FilterQueryParams {
  filters: FilterNode[];
  sort: SortEntry[];
  page: number;
  limit: number;
  searchTerm?: string;
}

export interface FilterQueryResult<T> {
  data: T[];
  total: number;
}
