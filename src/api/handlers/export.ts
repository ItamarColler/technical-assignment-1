import { filters as filterConfig } from "../lib/filter/transactions/config";
import { parseQueryParams } from "../lib/validation";
import { TransactionFilterFactory } from "../lib/filter/transactions/factory";
import type { FilterNode } from "../lib/filter/filter.types";
import { applyDateRangeFilters } from "../lib/filter/dateRange";
import { TransactionExcelFactory } from "../lib/excel/transactions";
import type { ExportMetadata } from "../lib/excel/excel.types";

function buildExportName(
  filters: Record<string, string | undefined>,
  searchTerm: string,
): { filename: string; sheetName: string } {
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = now.toTimeString().slice(0, 5).replace(":", "-"); // HH-MM

  const activeValues = Object.values(filters)
    .filter(Boolean)
    .map((v) => v!.toLowerCase().replace(/\s+/g, "-"));

  if (searchTerm)
    activeValues.push(
      `search-${searchTerm.toLowerCase().replace(/\s+/g, "-")}`,
    );

  const slug = activeValues.length > 0 ? `_${activeValues.join("_")}` : "";
  const filename = `transactions${slug}_${date}_${time}.xlsx`;

  const filterLabel =
    activeValues.length > 0 ? ` (${activeValues.join(", ")})` : "";
  const sheetName = `Transactions${filterLabel} ${date} ${time}`.slice(0, 31);

  return { filename, sheetName };
}

export async function handleExport(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const validation = parseQueryParams(url);

  const { sort, searchTerm, filters } = validation.ok
    ? validation.params
    : {
        sort: [{ by: "date", order: "desc" as const }],
        searchTerm: "",
        filters: {} as Record<string, string | undefined>,
      };

  const filterNodes: FilterNode[] = filterConfig.flatMap((node) => {
    const value = filters[node.key];
    return value ? [{ ...node, value }] : [];
  });

  applyDateRangeFilters(filters, filterNodes);

  try {
    const rows = await TransactionFilterFactory.Instance.queryAll({
      filters: filterNodes,
      sort,
      searchTerm,
    });

    const { filename, sheetName } = buildExportName(filters, searchTerm);

    const toLabel = (key: string) =>
      key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
    const filterParts = Object.entries(filters)
      .filter(([k, v]) => Boolean(v) && k !== "dateFrom" && k !== "dateTo")
      .map(([k, v]) => `${toLabel(k)}: ${v}`);
    if (filters["dateFrom"]) filterParts.push(`From: ${filters["dateFrom"]}`);
    if (filters["dateTo"]) filterParts.push(`To: ${filters["dateTo"]}`);
    if (searchTerm) filterParts.push(`Search: "${searchTerm}"`);

    const now = new Date();
    const metadata: ExportMetadata = {
      generatedAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      filters: filterParts.length > 0 ? filterParts.join(" · ") : "None",
    };

    const bytes = await TransactionExcelFactory.Instance.generate(
      rows,
      sheetName,
      metadata,
    );

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
