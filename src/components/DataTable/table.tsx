import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "./seketon";
import type { Cell, SortOrder } from "./types";

interface DataTableProps<T extends { id: number | string }> {
  columns: Cell<T>[];
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (sortBy: string, sortOrder: SortOrder) => void;
  data: T[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  onRowClick?: (row: T) => void;
  selectedId?: number | string | null;
}

export function DataTable<T extends { id: number | string }>({
  columns,
  sortBy,
  sortOrder,
  onSort,
  data,
  isLoading,
  hasLoaded,
  error,
  onRowClick,
  selectedId,
}: DataTableProps<T>) {
  function handleSort(key: string) {
    if (sortBy === key) {
      onSort(key, sortOrder === "desc" ? "asc" : "desc");
    } else {
      onSort(key, "desc");
    }
  }

  if (!hasLoaded && isLoading) return <SkeletonTable columns={columns} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-destructive font-bold text-lg">!</span>
        </div>
        <p className="text-sm text-muted-foreground">Failed to load data</p>
        <p className="text-xs font-mono text-destructive/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[930px] border-collapse text-sm [table-layout:fixed]">
        <colgroup>
          {columns.map(col => (
            <col
              key={col.key}
              style={col.width ? { width: col.width } : undefined}
              className={col.mobileHidden ? "hidden md:table-column" : undefined}
            />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium tracking-wide select-none cursor-pointer transition-colors",
                  col.mobileHidden && "hidden md:table-cell",
                  sortBy === col.key
                    ? "text-amber-400"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  <SortIcon colKey={col.key} sortBy={sortBy} sortOrder={sortOrder} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  onRowClick && "cursor-pointer",
                  row.id === selectedId
                    ? "bg-amber-500/10 ring-1 ring-inset ring-amber-500/30"
                    : i % 2 === 0
                      ? "bg-muted/20 hover:bg-amber-500/5"
                      : "hover:bg-amber-500/5"
                )}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-2.5 overflow-hidden", col.mobileHidden && "hidden md:table-cell")}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ colKey, sortBy, sortOrder }: { colKey: string; sortBy: string; sortOrder: SortOrder }) {
  if (colKey !== sortBy) return <ArrowUpDown className="size-3 opacity-30" />;
  return sortOrder === "desc"
    ? <ArrowDown className="size-3 text-amber-400" />
    : <ArrowUp className="size-3 text-amber-400" />;
}
