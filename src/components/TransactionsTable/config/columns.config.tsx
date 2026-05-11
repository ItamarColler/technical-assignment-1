import type { Cell } from "@/components/DataTable/types";
import type { TransactionRow } from "@/api/types";
import {
  DateCell,
  MethodCell,
  NetworkCell,
  BuyAmountCell,
  SellAmountCell,
  FeeAmountCell,
  CommentsCell,
  CurrencyCell,
} from "./columns";

export const COLUMNS: Cell<TransactionRow>[] = [
  {
    key: "date",
    label: "Date",
    ctx: { colClassName: "col-date" },
    render: row => <DateCell date={row.date} />,
  },
  {
    key: "method",
    label: "Method",
    ctx: { colClassName: "w-[95px]" },
    render: row => <MethodCell method={row.method} />,
  },
  {
    key: "network",
    label: "Network",
    ctx: { colClassName: "w-[90px]", desktopOnly: true },
    render: row => <NetworkCell network={row.network} />,
  },
  {
    key: "buyAmount",
    label: "Buy",
    ctx: { colClassName: "w-[75px]" },
    render: row => <BuyAmountCell buyAmount={row.buyAmount} buyCurrency={row.buyCurrency} />,
  },
  {
    key: "buyCurrency",
    label: "Buy Cur.",
    ctx: { colClassName: "w-[90px]", tabletHidden: true },
    render: row => <CurrencyCell currency={row.buyCurrency} />,
  },
  {
    key: "sellAmount",
    label: "Sell",
    ctx: { colClassName: "w-[75px]" },
    render: row => <SellAmountCell sellAmount={row.sellAmount} sellCurrency={row.sellCurrency} />,
  },
  {
    key: "sellCurrency",
    label: "Sell Cur.",
    ctx: { colClassName: "w-[90px]", tabletHidden: true },
    render: row => <CurrencyCell currency={row.sellCurrency} />,
  },
  {
    key: "feeAmount",
    label: "Fee",
    ctx: { colClassName: "w-[75px]", wideOnly: true },
    render: row => <FeeAmountCell feeAmount={row.feeAmount} feeCurrency={row.feeCurrency} />,
  },
  {
    key: "feeCurrency",
    label: "Fee Cur.",
    ctx: { colClassName: "w-[90px]", wideOnly: true },
    render: row => <CurrencyCell currency={row.feeCurrency} />,
  },
  {
    key: "comments",
    label: "Comments",
    ctx: { colClassName: "w-[100px]", desktopOnly: true },
    render: row => <CommentsCell comments={row.comments} />,
  },
];
