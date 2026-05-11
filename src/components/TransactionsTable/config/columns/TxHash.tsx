import { truncateHash } from "@/lib/formatters";
import type React from "react";

export const TxHashCell: React.FC<{ txHash: string | null }> = ({ txHash }) => (
  <span className="font-mono text-xs text-muted-foreground" title={txHash ?? undefined}>
    {truncateHash(txHash)}
  </span>
);

