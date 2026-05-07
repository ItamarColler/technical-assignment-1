import { formatAmount } from "@/lib/formatters";
import type React from "react";

export const BuyAmountCell: React.FC<{ buyAmount: number | null; buyCurrency: string | null }> = ({ buyAmount, buyCurrency }) => (
  <span className="font-mono text-xs text-emerald-400">
    {formatAmount(buyAmount, buyCurrency)}
  </span>
);
