import { parseQueryParams } from "../lib/validation";
import { TransactionFilterFactory } from "../lib/filter/transactions/factory";
import { filters as filterConfig } from "../lib/filter/transactions/config";
import type { FilterNode } from "../lib/filter/filter.types";
import { applyDateRangeFilters } from "../lib/filter/dateRange";

export async function handleGetTransactions(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const validation = parseQueryParams(url);

  if (!validation.ok) {
    return Response.json(
      { error: "Invalid query parameters", details: validation.error },
      { status: 400 },
    );
  }

  const { page, limit, sort, searchTerm, filters } = validation.params;

  const filterNodes: FilterNode[] = filterConfig.flatMap((node) => {
    const value = filters[node.key];
    return value ? [{ ...node, value }] : [];
  });

  applyDateRangeFilters(filters, filterNodes);

  const { data, total } = await TransactionFilterFactory.Instance.query({
    filters: filterNodes,
    sort,
    page,
    limit,
    searchTerm,
  });

  return Response.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
