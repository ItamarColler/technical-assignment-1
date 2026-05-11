import type React from "react";
import type { TransactionRow } from "@/api/types";

type Props = { currency: TransactionRow["buyCurrency" | "sellCurrency" | "feeCurrency"] };

export const CurrencyCell: React.FC<Props> = ({ currency }) => (
  <span className="font-mono text-xs text-muted-foreground/70 truncate block">
    {currency ?? "—"}
  </span>
);
