import type { TransactionRow } from "../../../types";
import type { ColumnDef } from "../excel.types";

export const TRANSACTION_COLUMNS: ColumnDef<TransactionRow>[] = [
  { header: "ID", getValue: (r) => r.id, type: "number" },
  { header: "Method", getValue: (r) => r.method, type: "text" },
  { header: "Buy Amount", getValue: (r) => r.buyAmount, type: "number" },
  { header: "Buy Currency", getValue: (r) => r.buyCurrency, type: "text" },
  { header: "Buy Token", getValue: (r) => r.buyToken, type: "text" },
  { header: "Sell Amount", getValue: (r) => r.sellAmount, type: "number" },
  { header: "Sell Currency", getValue: (r) => r.sellCurrency, type: "text" },
  { header: "Sell Token", getValue: (r) => r.sellToken, type: "text" },
  { header: "Fee Amount", getValue: (r) => r.feeAmount, type: "number" },
  { header: "Fee Currency", getValue: (r) => r.feeCurrency, type: "text" },
  { header: "Fee Token", getValue: (r) => r.feeToken, type: "text" },
  { header: "Date", getValue: (r) => r.date, type: "date" },
  { header: "Tx Hash", getValue: (r) => r.txHash, type: "text" },
  { header: "Block Height", getValue: (r) => r.blockHeight, type: "text" },
  { header: "Network", getValue: (r) => r.network, type: "text" },
  { header: "Smart Contract", getValue: (r) => r.smartContract, type: "text" },
  { header: "Sender Address", getValue: (r) => r.senderAddress, type: "text" },
  {
    header: "Receiver Address",
    getValue: (r) => r.receiverAddress,
    type: "text",
  },
  { header: "Comments", getValue: (r) => r.comments, type: "text" },
];
