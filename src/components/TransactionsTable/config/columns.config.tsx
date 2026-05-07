import type { Cell } from "@/components/DataTable/types";
import type { TransactionRow } from "@/api/types";
import {
  DateCell,
  MethodCell,
  NetworkCell,
  BuyAmountCell,
  SellAmountCell,
  FeeAmountCell,
  TxHashCell,
} from "./columns";

export const COLUMNS: Cell<TransactionRow>[] = [
  {
    key: "date",
    label: "Date",
    width: "140px",
    render: row => <DateCell date={row.date} />,
  },
  {
    key: "method",
    label: "Method",
    width: "100px",
    render: row => <MethodCell method={row.method} />,
  },
  {
    key: "network",
    label: "Network",
    width: "100px",
    mobileHidden: true,
    render: row => <NetworkCell network={row.network} />,
  },
  {
    key: "buyAmount",
    label: "Buy",
    width: "160px",
    render: row => <BuyAmountCell buyAmount={row.buyAmount} buyCurrency={row.buyCurrency} />,
  },
  {
    key: "sellAmount",
    label: "Sell",
    width: "160px",
    render: row => <SellAmountCell sellAmount={row.sellAmount} sellCurrency={row.sellCurrency} />,
  },
  {
    key: "feeAmount",
    label: "Fee",
    width: "140px",
    mobileHidden: true,
    render: row => <FeeAmountCell feeAmount={row.feeAmount} feeCurrency={row.feeCurrency} />,
  },
  {
    key: "txHash",
    label: "Tx Hash",
    width: "130px",
    mobileHidden: true,
    render: row => <TxHashCell txHash={row.txHash} />,
  },
];
