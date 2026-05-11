import type { TransactionRow } from "@/api/types";
import { TooltipRoot, TooltipBase, TooltipContent } from "@/components/ui/tooltip";

export const NetworkCell = ({ network }: Pick<TransactionRow, "network">) => {
  if (!network) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <TooltipRoot>
      <TooltipBase.Trigger
        render={<span className="text-xs text-muted-foreground truncate block cursor-default" />}
      >
        {network}
      </TooltipBase.Trigger>
      <TooltipContent>{network}</TooltipContent>
    </TooltipRoot>
  );
};
