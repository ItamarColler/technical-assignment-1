import { cn } from "@/lib/utils";
import type { CellContext } from "./types";

interface ColInfo {
  key: string;
  ctx?: CellContext;
}

const colVisibility = (ctx?: CellContext) => cn(
  ctx?.desktopOnly  && "hidden lg:table-column",
  ctx?.wideOnly     && "hidden md:table-column",
  ctx?.tabletHidden && "hidden sm:table-column",
);

const cellVisibility = (ctx?: CellContext) => cn(
  ctx?.desktopOnly  && "hidden lg:table-cell",
  ctx?.wideOnly     && "hidden md:table-cell",
  ctx?.tabletHidden && "hidden sm:table-cell",
);

export function SkeletonTable({ columns }: { columns: ColInfo[] }) {
  return (
    <table className="w-full min-w-[465px] sm:min-w-[690px] md:min-w-[890px] lg:min-w-[1080px] border-collapse text-sm [table-layout:fixed]">
      <colgroup>
        {columns.map(col => (
          <col
            key={col.key}
            className={cn(colVisibility(col.ctx), col.ctx?.colClassName)}
          />
        ))}
      </colgroup>
      <thead>
        <tr className="border-b border-border">
          {columns.map(col => (
            <th
              key={col.key}
              className={cn("px-2 py-1.5 lg:px-4 lg:py-2", cellVisibility(col.ctx))}
            >
              <div className="h-3 w-14 rounded bg-muted animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 8 }).map((_, i) => (
          <tr key={i} className="border-b border-border/50">
            {columns.map(col => (
              <td
                key={col.key}
                className={cn("px-2 py-1.5 lg:px-4 lg:py-3", cellVisibility(col.ctx))}
              >
                <div className="h-4 rounded bg-muted/60 animate-pulse w-20" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
