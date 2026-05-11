import { parseQueryParams } from "../lib/validation";
import { TransactionFilterFactory } from "../lib/filter/transactions/factory";
import { filters as filterConfig } from "../lib/filter/transactions/config";
import type { FilterNode } from "../lib/filter/filter.types";

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

  const dateFrom = filters["dateFrom"];
  const dateTo = filters["dateTo"];
  if (dateFrom) {
    const ts = new Date(dateFrom).getTime();
    if (!isNaN(ts)) filterNodes.push({ key: "date", title: "From", value: String(ts), operator: "gte" as const });
  }
  if (dateTo) {
    const ts = new Date(dateTo + "T23:59:59.999Z").getTime();
    if (!isNaN(ts)) filterNodes.push({ key: "date", title: "To", value: String(ts), operator: "lte" as const });
  }

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
