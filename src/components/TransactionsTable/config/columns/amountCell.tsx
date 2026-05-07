import { formatAmount, formatAmountShort } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface AmountCellProps {
  amount: number | null;
  currency: string | null;
  colorClass: string;
}

export function AmountCell({ amount, currency, colorClass }: AmountCellProps) {
  const full = formatAmount(amount, currency);
  const display = formatAmountShort(amount, currency);
  return (
    <span
      className={cn("font-mono text-xs block truncate", colorClass)}
      title={full}
    >
      {display}
    </span>
  );
}
