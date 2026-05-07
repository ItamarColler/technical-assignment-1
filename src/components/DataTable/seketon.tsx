import { cn } from "@/lib/utils";

interface ColInfo {
  key: string;
  mobileHidden?: boolean;
}

export function SkeletonTable({ columns }: { columns: ColInfo[] }) {
  return (
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-border">
          {columns.map(col => (
            <th key={col.key} className={cn("px-4 py-3", col.mobileHidden && "hidden md:table-cell")}>
              <div className="h-3 w-14 rounded bg-muted animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 8 }).map((_, i) => (
          <tr key={i} className="border-b border-border/50">
            {columns.map(col => (
              <td key={col.key} className={cn("px-4 py-3", col.mobileHidden && "hidden md:table-cell")}>
                <div className="h-4 rounded bg-muted/60 animate-pulse w-20" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
