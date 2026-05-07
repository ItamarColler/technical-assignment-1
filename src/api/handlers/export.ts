import { asc } from "drizzle-orm";
import { db } from "../database";
import { transactions } from "../database/schema";
import { generateXlsx } from "../lib/xlsx";

export async function handleExport(_req: Request): Promise<Response> {
  try {
    const rows = await db.select().from(transactions).orderBy(asc(transactions.date));
    const bytes = await generateXlsx(rows);

    return new Response(bytes, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="transactions.xlsx"',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Phase 4")) {
      return Response.json({ error: "XLSX export not yet implemented" }, { status: 501 });
    }
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
