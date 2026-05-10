import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonTable } from "./seketon";
import type { Cell } from "./types";
import type { SortEntry, SortOrder } from "@/api/lib/filter/filter.types";

interface DataTableProps<T extends { id: number | string }> {
  columns: Cell<T>[];
  sort: SortEntry[];
  onSort: (sort: SortEntry[]) => void;
  data: T[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  onRowClick?: (row: T) => void;
  selectedId?: number | string | null;
}

export function DataTable<T extends { id: number | string }>({
  columns,
  sort,
  onSort,
  data,
  isLoading,
  hasLoaded,
  error,
  onRowClick,
  selectedId,
}: DataTableProps<T>) {
  function handleSort(key: string, isMulti: boolean) {
    const existingIndex = sort.findIndex(s => s.by === key);

    if (!isMulti) {
      // Single click: replace entire sort with this column
      if (existingIndex !== -1) {
        const current = sort[existingIndex];
        onSort([{ by: key, order: current?.order === "desc" ? "asc" : "desc" }]);
      } else {
        onSort([{ by: key, order: "desc" }]);
      }
      return;
    }

    // Shift+click: add/toggle/remove from multi-sort list
    if (existingIndex !== -1) {
      const current = sort[existingIndex];
      if (current?.order === "desc") {
        // Toggle to asc
        const next = [...sort];
        next[existingIndex] = { by: key, order: "asc" };
        onSort(next);
      } else {
        // Remove from sort
        onSort(sort.filter((_, i) => i !== existingIndex));
      }
    } else {
      onSort([...sort, { by: key, order: "desc" }]);
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
            {columns.map(col => {
              const sortIndex = sort.findIndex(s => s.by === col.key);
              const isActive = sortIndex !== -1;
              const currentOrder = isActive ? sort[sortIndex]?.order : undefined;

              return (
                <th
                  key={col.key}
                  onClick={e => handleSort(col.key, e.shiftKey)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium tracking-wide select-none cursor-pointer transition-colors",
                    col.mobileHidden && "hidden md:table-cell",
                    isActive
                      ? "text-amber-400"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon
                      isActive={isActive}
                      order={currentOrder}
                      index={sort.length > 1 ? sortIndex + 1 : undefined}
                    />
                  </span>
                </th>
              );
            })}
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

function SortIcon({ isActive, order, index }: { isActive: boolean; order?: SortOrder; index?: number }) {
  if (!isActive) return <ArrowUpDown className="size-3 opacity-30" />;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {order === "desc"
        ? <ArrowDown className="size-3" />
        : <ArrowUp className="size-3" />}
      {index !== undefined && (
        <span className="text-[10px] font-bold leading-none">{index}</span>
      )}
    </span>
  );
}
