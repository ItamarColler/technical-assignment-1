import type { FilterDTO } from "@/components/DataTable/types";

export function buildFilterUrl(baseUrl: string, params: FilterDTO): string {
  const url = new URL(baseUrl, window.location.origin);

  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));
  url.searchParams.set("sortBy", params.sortBy);
  url.searchParams.set("sortOrder", params.sortOrder);

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
