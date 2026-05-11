import type { TransactionRow } from "../../../types";
import type { ColumnDef } from "../excel.types";

export const TRANSACTION_COLUMNS: ColumnDef<TransactionRow>[] = [
  { header: "Method",           getValue: (r) => r.method,          type: "text",   width: 14 },
  { header: "Buy Amount",       getValue: (r) => r.buyAmount,       type: "number", width: 13 },
  { header: "Buy Currency",     getValue: (r) => r.buyCurrency,     type: "text",   width: 14 },
  { header: "Buy Token",        getValue: (r) => r.buyToken,        type: "text",   width: 14 },
  { header: "Sell Amount",      getValue: (r) => r.sellAmount,      type: "number", width: 13 },
  { header: "Sell Currency",    getValue: (r) => r.sellCurrency,    type: "text",   width: 14 },
  { header: "Sell Token",       getValue: (r) => r.sellToken,       type: "text",   width: 14 },
  { header: "Fee Amount",       getValue: (r) => r.feeAmount,       type: "number", width: 13 },
  { header: "Fee Currency",     getValue: (r) => r.feeCurrency,     type: "text",   width: 14 },
  { header: "Fee Token",        getValue: (r) => r.feeToken,        type: "text",   width: 14 },
  { header: "Date",             getValue: (r) => r.date,            type: "date",   width: 14 },
  { header: "Tx Hash",          getValue: (r) => r.txHash,          type: "text",   width: 44 },
  { header: "Block Height",     getValue: (r) => r.blockHeight,     type: "text",   width: 14 },
  { header: "Network",          getValue: (r) => r.network,         type: "text",   width: 16 },
  { header: "Smart Contract",   getValue: (r) => r.smartContract,   type: "text",   width: 44 },
  { header: "Sender Address",   getValue: (r) => r.senderAddress,   type: "text",   width: 44 },
  { header: "Receiver Address", getValue: (r) => r.receiverAddress, type: "text",   width: 44 },
  { header: "Comments",         getValue: (r) => r.comments,        type: "text",   width: 28 },
];
