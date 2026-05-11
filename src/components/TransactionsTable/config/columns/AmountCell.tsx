import { formatAmount, formatAmountCompact } from "@/lib/formatters";
import { TooltipRoot, TooltipBase, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AmountCellProps {
  amount: number | null;
  currency: string | null;
  colorClass: string;
}

export function AmountCell({ amount, currency, colorClass }: AmountCellProps) {
  const full = formatAmount(amount, currency);
  const display = formatAmountCompact(amount);
  return (
    <TooltipRoot>
      <TooltipBase.Trigger
        render={<span className={cn("font-mono text-xs block truncate cursor-default", colorClass)} />}
      >
        {display}
      </TooltipBase.Trigger>
      <TooltipContent>{full}</TooltipContent>
    </TooltipRoot>
  );
}
