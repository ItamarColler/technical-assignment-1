import { useState, useEffect, useRef } from "react";
import type {
  FilterDTO,
  FilterNode,
  SortOrder,
} from "@/components/DataTable/types";
import type { PaginatedResponse } from "@/api/types";
import { buildFilterUrl, fetchFilterOptions } from "./filter.utils";

export interface FilterQueryConfig {
  url: string;
  filterOptionsUrl?: string;
  defaultParams: FilterDTO;
}

export function useFilterQuery<T>(config: FilterQueryConfig) {
  const { url, filterOptionsUrl, defaultParams } = config;
  const defaultParamsRef = useRef(defaultParams);

  const [params, setParams] = useState<FilterDTO>(defaultParams);
  const [result, setResult] = useState<PaginatedResponse<T> | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>(
    {},
  );
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!filterOptionsUrl) return;
    const controller = new AbortController();
    fetchFilterOptions(filterOptionsUrl, setFilterOptions, controller.signal);
    return () => controller.abort();
  }, [filterOptionsUrl]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(buildFilterUrl(url, params), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PaginatedResponse<T> = await res.json();
        setResult(data);
        setHasLoaded(true);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [url, params]);

  function setFilter(filter: FilterNode) {
    setParams((prev) => {
      const rest = prev.filters.filter((f) => f.key !== filter.key);
      const next = filter.value ? [...rest, filter] : rest;
      return { ...prev, page: 1, filters: next };
    });
  }

  function clearFilters() {
    setParams((prev) => ({
      ...prev,
      page: 1,
      filters: defaultParamsRef.current.filters,
    }));
  }

  function setSort(sortBy: string, sortOrder: SortOrder) {
    setParams((prev) => ({ ...prev, page: 1, sortBy, sortOrder }));
  }

  function setPage(page: number) {
    setParams((prev) => ({ ...prev, page }));
  }

  return {
    data: result?.data ?? [],
    total: result?.total ?? 0,
    page: result?.page ?? params.page,
    totalPages: result?.totalPages ?? 0,
    isLoading,
    hasLoaded,
    error,
    filterOptions,
    params,
    setFilter,
    clearFilters,
    setSort,
    setPage,
  };
}
