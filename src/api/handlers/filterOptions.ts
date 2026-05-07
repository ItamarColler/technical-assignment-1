import { sql } from "drizzle-orm";
import { db } from "../database";
import { transactions } from "../database/schema";

export async function handleGetFilterOptions(_req: Request): Promise<Response> {
  const [methods, networks, buyCurrencies, sellCurrencies] = await Promise.all([
    db
      .select({ value: transactions.method })
      .from(transactions)
      .where(sql`${transactions.method} IS NOT NULL`)
      .groupBy(transactions.method)
      .orderBy(transactions.method),
    db
      .select({ value: transactions.network })
      .from(transactions)
      .where(sql`${transactions.network} IS NOT NULL`)
      .groupBy(transactions.network)
      .orderBy(transactions.network),
    db
      .select({ value: transactions.buyCurrency })
      .from(transactions)
      .where(sql`${transactions.buyCurrency} IS NOT NULL`)
      .groupBy(transactions.buyCurrency)
      .orderBy(transactions.buyCurrency),
    db
      .select({ value: transactions.sellCurrency })
      .from(transactions)
      .where(sql`${transactions.sellCurrency} IS NOT NULL`)
      .groupBy(transactions.sellCurrency)
      .orderBy(transactions.sellCurrency),
  ]);

  return Response.json({
    method: methods.map(r => r.value).filter(Boolean),
    network: networks.map(r => r.value).filter(Boolean),
    buyCurrency: buyCurrencies.map(r => r.value).filter(Boolean),
    sellCurrency: sellCurrencies.map(r => r.value).filter(Boolean),
  });
}
