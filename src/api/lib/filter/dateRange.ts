import type { FilterNode } from "./filter.types";

export function applyDateRangeFilters(
  filters: Record<string, string | undefined>,
  filterNodes: FilterNode[],
): void {
  const dateFrom = filters["dateFrom"];
  const dateTo = filters["dateTo"];
  if (dateFrom) {
    const ts = new Date(dateFrom).getTime();
    if (!isNaN(ts))
      filterNodes.push({ key: "date", title: "From", value: String(ts), operator: "gte" });
  }
  if (dateTo) {
    const ts = new Date(dateTo + "T23:59:59.999Z").getTime();
    if (!isNaN(ts))
      filterNodes.push({ key: "date", title: "To", value: String(ts), operator: "lte" });
  }
}
