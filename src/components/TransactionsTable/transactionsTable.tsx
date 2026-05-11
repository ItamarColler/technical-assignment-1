import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { DataTable, FilterPanel } from "@/components/DataTable";
import { ExportButton } from "./ExportButton";
import { Pagination } from "@/components/TransactionsTable/pagination";
import { TransactionDialog } from "./TransactionDialog";
import { useFilterQuery } from "@/hooks/filter";
import type { TransactionRow } from "@/api/types";
import { COLUMNS, QUERY_CONFIG, TRANSACTION_FILTERS, ADVANCED_FILTERS, SEARCH_CONFIG, API_CONFIG } from "./config";

export function TransactionsTable() {
  const [selectedRow, setSelectedRow] = useState<TransactionRow | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    data, total, page, totalPages,
    isLoading, hasLoaded, error,
    filterOptions, params,
    hasUserSort,
    setFilter, clearFilters, setSort, setPage, setSearchTerm,
  } = useFilterQuery<TransactionRow>(QUERY_CONFIG);

  const dateFrom = params.filters.find(f => f.key === "dateFrom")?.value ?? "";
  const dateTo = params.filters.find(f => f.key === "dateTo")?.value ?? "";

  function setDateFrom(val: string) {
    setFilter({ key: "dateFrom", title: "From", value: val || undefined });
  }
  function setDateTo(val: string) {
    setFilter({ key: "dateTo", title: "To", value: val || undefined });
  }

  const { scrolledDown, pause } = useScrollDirection();

  useEffect(() => {
    if (scrolledDown) setFiltersOpen(false);
  }, [scrolledDown]);

  const hasActive =
    params.filters.some(f => f.value) ||
    params.searchTerm.length > 0 ||
    hasUserSort;

  return (
    <>
      {/* Sticky filter bar — hides on scroll-down, reappears on scroll-up */}
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
            <ExportButton disabled={isLoading} params={params} exportUrl={API_CONFIG.exportUrl} />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 relative">
          {isLoading && hasLoaded && (
            <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] rounded-xl" />
          )}
          <DataTable
            columns={COLUMNS}
            sort={hasUserSort ? params.sort : []}
            onSort={setSort}
            data={data}
            isLoading={isLoading}
            hasLoaded={hasLoaded}
            error={error}
            onRowClick={setSelectedRow}
            selectedId={selectedRow?.id ?? null}
          />
        </CardContent>

        {!error && hasLoaded && (
          <CardFooter>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={params.limit}
              onPageChange={setPage}
            />
          </CardFooter>
        )}
      </Card>

      <TransactionDialog row={selectedRow} onClose={() => setSelectedRow(null)} />
    </>
  );
}
