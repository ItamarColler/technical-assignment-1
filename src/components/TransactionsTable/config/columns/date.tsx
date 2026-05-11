import type { TransactionRow } from "@/api/types";
import { formatDate, formatDateVerbose } from "@/lib/formatters";
import { TooltipRoot, TooltipBase, TooltipContent } from "@/components/ui/tooltip";

export const DateCell = ({ date }: Pick<TransactionRow, "date">) => (
  <TooltipRoot>
    <TooltipBase.Trigger
      render={<span className="font-mono text-xs text-muted-foreground whitespace-nowrap cursor-default" />}
    >
      {formatDate(date)}
    </TooltipBase.Trigger>
    <TooltipContent>{formatDateVerbose(date)}</TooltipContent>
  </TooltipRoot>
);
