import { TransactionFilterFactory } from "../lib/filter/transactions/factory";
import { filters } from "../lib/filter/transactions/config";

export async function handleGetFilterOptions(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const filterNodes = filters.flatMap((node) => {
    const value = url.searchParams.get(`filter[${node.key}]`) ?? undefined;
    return value ? [{ ...node, value }] : [];
  });

  return Response.json(
    await TransactionFilterFactory.Instance.getFilterOptions(filterNodes),
  );
}
