import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { StickyFilterBar } from "./StickyFilterBar";
import { Pagination } from "./Pagination";
import { TransactionDialog } from "./TransactionDialog";
import { useFilterQuery } from "@/hooks/useFilterQuery";
import type { TransactionRow } from "@/api/types";
import { COLUMNS, QUERY_CONFIG, API_CONFIG } from "./config";

export function TransactionsTable() {
  const [selectedRow, setSelectedRow] = useState<TransactionRow | null>(null);

  const {
    data, total, page, totalPages,
    isLoading, hasLoaded, error,
    filterOptions, params,
    hasUserSort,
    setFilter, clearFilters, setSort, setPage, setSearchTerm,
  } = useFilterQuery<TransactionRow>(QUERY_CONFIG);

  const dateFrom = params.filters.find(f => f.key === "dateFrom")?.value ?? "";
  const dateTo = params.filters.find(f => f.key === "dateTo")?.value ?? "";

  const hasActive =
    params.filters.some(f => f.value) ||
    params.searchTerm.length > 0 ||
    hasUserSort;

  return (
    <>
      <StickyFilterBar
        filterOptions={filterOptions}
        params={params}
        setFilter={setFilter}
        clearFilters={clearFilters}
        setSearchTerm={setSearchTerm}
        hasActive={hasActive}
        dateFrom={dateFrom}
        dateTo={dateTo}
        setDateFrom={(val) => setFilter({ key: "dateFrom", title: "From", value: val || undefined })}
        setDateTo={(val) => setFilter({ key: "dateTo", title: "To", value: val || undefined })}
        isLoading={isLoading}
        exportUrl={API_CONFIG.exportUrl}
      />

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
