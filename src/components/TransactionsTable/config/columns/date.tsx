import { formatDate } from "@/lib/formatters";
import type React from "react";

export const DateCell: React.FC<{ date: Date }> = ({ date }) => (
  <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
    {formatDate(date)}
  </span>
);
