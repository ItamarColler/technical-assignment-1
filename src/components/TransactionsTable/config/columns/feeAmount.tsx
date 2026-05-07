import { formatAmount } from "@/lib/formatters";
import type React from "react";

export const FeeAmountCell: React.FC<{ feeAmount: number | null; feeCurrency: string | null }> = ({ feeAmount, feeCurrency }) => (
  <span className="font-mono text-xs text-muted-foreground">
    {formatAmount(feeAmount, feeCurrency)}
  </span>
);
