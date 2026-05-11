import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const windows = buildPageWindows(page, totalPages);

  return (
    <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between w-full">
      <span className="text-xs text-muted-foreground font-mono tabular-nums">
        {total === 0 ? "No results" : `${from}–${to} of ${total.toLocaleString()}`}
      </span>

      <div className="flex items-center justify-between sm:justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="First page"
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>

        {/* Page number buttons — tablet+ only */}
        <div className="hidden sm:flex items-center gap-0.5">
          {windows.map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-xs text-muted-foreground select-none"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant="ghost"
                size="icon-sm"
                onClick={() => onPageChange(p)}
                className={cn(
                  "min-w-7 w-auto px-1 text-xs tabular-nums",
                  p === page && "bg-amber-500/15 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                )}
              >
                {p}
              </Button>
            )
          )}
        </div>

        {/* Mobile page indicator — mobile only */}
        <span className="sm:hidden text-xs text-muted-foreground font-mono tabular-nums">
          {page} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}

function buildPageWindows(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const rangeStart = Math.max(2, current - 2);
  const rangeEnd = Math.min(total - 1, current + 2);
  const items: (number | "ellipsis")[] = [1];

  if (rangeStart > 2) items.push("ellipsis");
  for (let i = rangeStart; i <= rangeEnd; i++) items.push(i);
  if (rangeEnd < total - 1) items.push("ellipsis");

  items.push(total);
  return items;
}
