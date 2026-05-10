import { parseQueryParams } from "../lib/validation";
import { TransactionFilterFactory } from "../lib/filter/transactions/factory";
import { filters as filterConfig } from "../lib/filter/transactions/config";
import { generateXlsx } from "../lib/xlsx";

export async function handleExport(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const validation = parseQueryParams(url);

  const { sort, searchTerm, filters } = validation.ok
    ? validation.params
    : { sort: [{ by: "date", order: "desc" as const }], searchTerm: "", filters: {} as Record<string, string | undefined> };

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
    const bytes = await generateXlsx(rows);

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="transactions.xlsx"',
      },
    });
  } catch {
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
