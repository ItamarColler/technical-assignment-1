import { formatAmount } from "@/lib/formatters";
import type React from "react";

export const SellAmountCell: React.FC<{ sellAmount: number | null; sellCurrency: string | null }> = ({ sellAmount, sellCurrency }) => (
  <span className="font-mono text-xs text-rose-400">
    {formatAmount(sellAmount, sellCurrency)}
  </span>
);
