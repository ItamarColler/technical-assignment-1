import {
  and,
  asc,
  count,
  desc,
  eq,
  getColumns,
  isNotNull,
  like,
  or,
  sql,
} from "drizzle-orm";
import type { AnyColumn, InferSelectModel, SQL } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "../../database";
import type {
  FilterConfig,
  FilterData,
  FilterNode,
  FilterQueryParams,
  FilterQueryResult,
} from "./filter.types";

export class FilterFactory<TTable extends SQLiteTable> {
  protected readonly table: TTable;
  protected filters: FilterConfig[];
  protected searchFields: string[];
  protected sortFields: { [key: string]: string };

  constructor(table: TTable, config: FilterData) {
    this.table = table;
    this.filters = config.filters;
    this.searchFields = config.searchFields || [];
    this.sortFields = config.sortFields || {};
  }

  async getFilterOptions(
    filterNodes: FilterNode[],
  ): Promise<Record<string, string[]>> {
    const results = await Promise.all(
      this.filters.map(({ key }) => {
        const col = this.getColumn(key);
        const where = and(
          isNotNull(col),
          this.buildConditions(filterNodes.filter((n) => n.key !== key)),
        );

        return db
          .select({ value: col })
          .from(this.table)
          .where(where)
          .groupBy(col)
          .orderBy(col);
      }),
    );

    return Object.fromEntries(
      this.filters.map(({ key }, i) => [
        key,
        (results[i] ?? [])
          .map((r: { value: unknown }) => r.value)
          .filter(Boolean) as string[],
      ]),
    );
  }

  buildQuery(params: FilterQueryParams) {
    const where = this.buildConditions(params.filters, params.searchTerm);
    const orderExprs = params.sort.map(({ by, order }) => {
      const col = this.getColumn(by);
      return order === "asc" ? asc(col) : desc(col);
    });

    return db
      .select()
      .from(this.table)
      .where(where)
      .orderBy(...orderExprs)
      .limit(params.limit)
      .offset((params.page - 1) * params.limit);
  }

  async query(
    params: FilterQueryParams,
  ): Promise<FilterQueryResult<InferSelectModel<TTable>>> {
    const where = this.buildConditions(params.filters, params.searchTerm);

    const [countResult, data] = await Promise.all([
      db.select({ count: count() }).from(this.table).where(where),
      this.buildQuery(params),
    ]);

    return {
      data: data as InferSelectModel<TTable>[],
      total: countResult[0]?.count ?? 0,
    };
  }

  async queryAll(
    params: Pick<FilterQueryParams, "filters" | "sort" | "searchTerm">,
  ): Promise<InferSelectModel<TTable>[]> {
    const where = this.buildConditions(params.filters, params.searchTerm);
    const orderExprs = params.sort.map(({ by, order }) => {
      const col = this.getColumn(by);
      return order === "asc" ? asc(col) : desc(col);
    });
    const data = await db.select().from(this.table).where(where).orderBy(...orderExprs);
    return data as InferSelectModel<TTable>[];
  }

  private getColumn(key: string): AnyColumn {
    return getColumns(this.table)[key] as AnyColumn;
  }

  private buildConditions(nodes: FilterNode[], searchTerm?: string): SQL {
    const conditions: SQL[] = [];
    for (const { key, value, operator = "eq" } of nodes) {
      const col = this.getColumn(key);
      if (!col || !value) continue;
      if (operator === "gte") conditions.push(sql`${col} >= ${Number(value)}`);
      else if (operator === "lte") conditions.push(sql`${col} <= ${Number(value)}`);
      else if (operator === "like") conditions.push(like(col, `%${value}%`));
      else conditions.push(eq(col, value));
    }
    if (searchTerm) {
      const searchConditions = this.searchFields
        .map((field) => this.getColumn(field))
        .filter(Boolean)
        .map((col) => like(col, `%${searchTerm}%`));
      if (searchConditions.length > 0) {
        conditions.push(or(...searchConditions) as SQL);
      }
    }
    return conditions.length > 0 ? (and(...conditions) as SQL) : sql`1=1`;
  }
}
