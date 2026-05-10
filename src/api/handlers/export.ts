import { filters as filterConfig } from "../lib/filter/transactions/config";
import { parseQueryParams } from "../lib/validation";
import { TransactionFilterFactory } from "../lib/filter/transactions/factory";
import { TransactionExcelFactory } from "../lib/excel/transactions";

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
  const sheetName = `Transactions${filterLabel} ${date} ${time}`;

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

  const filterNodes = filterConfig.flatMap((node) => {
    const value = filters[node.key];
    return value ? [{ ...node, value }] : [];
  });

  try {
    const rows = await TransactionFilterFactory.Instance.queryAll({
      filters: filterNodes,
      sort,
      searchTerm,
    });

    const { filename, sheetName } = buildExportName(filters, searchTerm);
    const bytes = await TransactionExcelFactory.Instance.generate(
      rows,
      sheetName,
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
