import { cn } from "@/lib/utils";
import type React from "react";

const METHOD_COLORS: Record<string, string> = {
  buy: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  sell: "bg-rose-500/15 text-rose-400 ring-rose-500/30",
  swap: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  transfer: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  fee: "bg-neutral-500/15 text-neutral-400 ring-neutral-500/30",
};
const DEFAULT_COLOR = "bg-violet-500/15 text-violet-400 ring-violet-500/30";

export const MethodCell: React.FC<{ method: string }> = ({ method }) => {
  const cls = METHOD_COLORS[method.toLowerCase()] ?? DEFAULT_COLOR;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        cls
      )}
    >
      {method}
    </span>
  );
};
