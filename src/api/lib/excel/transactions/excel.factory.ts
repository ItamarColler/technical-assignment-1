import { ExcelFactory } from "../xlsx";
import { transactions } from "./../../../database/schema";
import { TRANSACTION_COLUMNS } from "./config";
export class TransactionExcelFactory extends ExcelFactory<typeof transactions> {
  private static instance: TransactionExcelFactory;
  constructor() {
    super(transactions, TRANSACTION_COLUMNS);
  }

  public static get Instance(): TransactionExcelFactory {
    this.instance ||= new TransactionExcelFactory();
    return this.instance;
  }
}
