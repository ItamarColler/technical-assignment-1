import { FilterFactory } from "../filter.factory";
import { transactions } from "../../../database/schema";
import type { FilterData } from "../filter.types";
import { SortFieldsParams, filters, searchFields } from "./config";

export class TransactionFilterFactory extends FilterFactory<
  typeof transactions
> {
  private static instance: TransactionFilterFactory;

  constructor() {
    const data: FilterData = {
      filters: filters,
      sortFields: SortFieldsParams,
      searchFields,
    };
    super(transactions, data);
  }

  public static get Instance(): TransactionFilterFactory {
    this.instance ||= new TransactionFilterFactory();
    return this.instance;
  }
}
