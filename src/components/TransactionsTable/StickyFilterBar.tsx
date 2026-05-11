import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FilterPanel } from "@/components/DataTable";
import { ExportButton } from "./ExportButton";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { TRANSACTION_FILTERS, ADVANCED_FILTERS, SEARCH_CONFIG } from "./config";
import type { FilterNode, FilterDTO } from "@/api/lib/filter/filter.types";

interface StickyFilterBarProps {
  filterOptions: Record<string, string[]>;
  params: FilterDTO;
  setFilter: (filter: FilterNode) => void;
  clearFilters: () => void;
  setSearchTerm: (val: string) => void;
  hasActive: boolean;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (val: string) => void;
  setDateTo: (val: string) => void;
  isLoading: boolean;
  exportUrl: string;
}

export function StickyFilterBar({
  filterOptions, params, setFilter, clearFilters, setSearchTerm,
  hasActive, dateFrom, dateTo, setDateFrom, setDateTo,
  isLoading, exportUrl,
}: StickyFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { scrolledDown, pause } = useScrollDirection();

  useEffect(() => {
    if (scrolledDown) setFiltersOpen(false);
  }, [scrolledDown]);

  return (
    <div className={cn(
      "sticky top-0 z-30 mb-3",
      "rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3",
      "transition-transform duration-300 ease-in-out will-change-transform",
      "shadow-[0_4px_24px_-8px_hsl(var(--foreground)/0.08)]",
      scrolledDown ? "-translate-y-[calc(100%+0.75rem)]" : "translate-y-0"
    )}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <div className="flex-1 min-w-0">
          <FilterPanel
            filters={TRANSACTION_FILTERS}
            advancedFilters={ADVANCED_FILTERS}
            filterOptions={filterOptions}
            params={params}
            setFilter={setFilter}
            clearFilters={clearFilters}
            searchTerm={params.searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder={SEARCH_CONFIG.placeholder}
            hasActive={hasActive}
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            filtersOpen={filtersOpen}
            onFiltersOpenChange={(open) => {
              if (open) pause(400);
              setFiltersOpen(open);
            }}
            onAdvancedOpenChange={(open) => {
              if (open) pause(400);
            }}
          />
        </div>
        <div className="shrink-0">
          <ExportButton disabled={isLoading} params={params} exportUrl={exportUrl} />
        </div>
      </div>
    </div>
  );
}
