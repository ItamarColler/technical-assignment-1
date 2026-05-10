import type { FilterConfig } from "../filter.types";

export const Fields = {
  method: "method",
  network: "network",
  buyCurrency: "buyCurrency",
  sellCurrency: "sellCurrency",
  date: "date",
  id: "id",
  buyAmount: "buyAmount",
  buyToken: "buyToken",
  sellAmount: "sellAmount",
  sellToken: "sellToken",
  feeAmount: "feeAmount",
  feeCurrency: "feeCurrency",
  feeToken: "feeToken",
  txHash: "txHash",
  blockHeight: "blockHeight",
  smartContract: "smartContract",
  senderAddress: "senderAddress",
  receiverAddress: "receiverAddress",
  comments: "comments",
} as const;

export const filters: FilterConfig[] = [
  { key: Fields.method, title: "Method" },
  { key: Fields.network, title: "Network" },
  { key: Fields.buyCurrency, title: "Buy Currency" },
  { key: Fields.sellCurrency, title: "Sell Currency" },
  { key: Fields.feeCurrency, title: "Fee Currency" },
  { key: Fields.date, title: "Date" },
];

export const searchFields: string[] = [
  Fields.comments,
  Fields.senderAddress,
  Fields.receiverAddress,
];

export const SortFieldsParams: Record<string, string> = {
  [Fields.date]: "Date",
  [Fields.method]: "Method",
  [Fields.network]: "Network",
  [Fields.buyAmount]: "Buy",
  [Fields.sellAmount]: "Sell",
  [Fields.feeAmount]: "Fee",
  [Fields.txHash]: "Tx Hash",
};
