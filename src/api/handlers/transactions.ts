import { parseQueryParams } from "../lib/validation";
import { queryTransactions } from "../lib/queryBuilder";

export async function handleGetTransactions(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const validation = parseQueryParams(url);

  if (!validation.ok) {
    return Response.json({ error: "Invalid query parameters", details: validation.error }, { status: 400 });
  }

  const { data, total } = await queryTransactions(validation.params);
  const { page, limit } = validation.params;

  return Response.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
