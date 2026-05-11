import type { FilterDTO, FilterNode } from "@/api/lib/filter/filter.types";

export function buildFilterUrl(baseUrl: string, params: FilterDTO): string {
  const url = new URL(baseUrl, window.location.origin);

  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));

  if (params.sort.length > 0) {
    url.searchParams.set("sort", params.sort.map(s => `${s.by}:${s.order}`).join(","));
  }

  if (params.searchTerm) {
    url.searchParams.set("searchTerm", params.searchTerm);
  }

  for (const node of params.filters) {
    if (node.value) url.searchParams.set(`filter[${node.key}]`, node.value);
  }

  return url.toString();
}

export async function fetchFilterOptions(
  url: string,
  set: (opts: Record<string, string[]>) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return;
    set(await res.json());
  } catch {
    // leave defaults
  }
}

export function buildExportUrl(baseUrl: string, params: FilterDTO): string {
  const url = new URL(baseUrl, window.location.origin);
  if (params.sort.length > 0) {
    url.searchParams.set("sort", params.sort.map(s => `${s.by}:${s.order}`).join(","));
  }
  if (params.searchTerm) url.searchParams.set("searchTerm", params.searchTerm);
  for (const node of params.filters) {
    if (node.value) url.searchParams.set(`filter[${node.key}]`, node.value);
  }
  return url.toString();
}

export function buildFilterOptionsUrl(baseUrl: string, filters: FilterNode[]): string {
  const url = new URL(baseUrl, window.location.origin);
  for (const node of filters) {
    if (node.value) url.searchParams.set(`filter[${node.key}]`, node.value);
  }
  return url.toString();
}
