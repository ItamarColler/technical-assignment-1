import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          onClick={() => onPageChange(Math.max(1, page - 5))}
          disabled={page <= 1}
          aria-label="Back 5 pages"
          className="text-[10px] font-mono tabular-nums"
        >
          −5
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

        {/* Go-to-page input — always visible; replaces static indicator on mobile */}
        <GoToPage key={page} page={page} totalPages={totalPages} onPageChange={onPageChange} />

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
          onClick={() => onPageChange(Math.min(totalPages, page + 5))}
          disabled={page >= totalPages}
          aria-label="Forward 5 pages"
          className="text-[10px] font-mono tabular-nums"
        >
          +5
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

function GoToPage({ page, totalPages, onPageChange }: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const [value, setValue] = useState(String(page));

  const submit = () => {
    const n = parseInt(value, 10);
    if (!isNaN(n)) {
      onPageChange(Math.max(1, Math.min(totalPages, n)));
    } else {
      setValue(String(page));
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono tabular-nums">
      <Input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        onFocus={(e) => e.target.select()}
        onBlur={() => setValue(String(page))}
        className="w-9 px-1 text-xs text-center font-mono tabular-nums"
        aria-label="Go to page"
      />
      <span>/ {totalPages}</span>
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
