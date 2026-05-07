import { and, asc, count, desc, eq } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { db } from "../database";
import { transactions } from "../database/schema";
import type { ParsedQueryParams, TransactionRow } from "../types";

export interface QueryResult {
  data: TransactionRow[];
  total: number;
}

export async function queryTransactions(params: ParsedQueryParams): Promise<QueryResult> {
  const conditions: SQL[] = [];

  if (params.filters.method)
    conditions.push(eq(transactions.method, params.filters.method));
  if (params.filters.network)
    conditions.push(eq(transactions.network, params.filters.network));
  if (params.filters.buyCurrency)
    conditions.push(eq(transactions.buyCurrency, params.filters.buyCurrency));
  if (params.filters.sellCurrency)
    conditions.push(eq(transactions.sellCurrency, params.filters.sellCurrency));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const col = transactions[params.sortBy as keyof typeof transactions] as Parameters<typeof asc>[0];
  const orderExpr = params.sortOrder === "asc" ? asc(col) : desc(col);

  const [countResult, data] = await Promise.all([
    db.select({ count: count() }).from(transactions).where(where),
    db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(orderExpr)
      .limit(params.limit)
      .offset((params.page - 1) * params.limit),
  ]);

  return { data, total: countResult[0]?.count ?? 0 };
}
