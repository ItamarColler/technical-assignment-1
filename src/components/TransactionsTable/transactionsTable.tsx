import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DataTable, FilterPanel } from "@/components/DataTable";
import { ExportButton } from "./ExportButton";
import { Pagination } from "@/components/TransactionsTable/pagination";
import { TransactionDialog } from "./TransactionDialog";
import { useFilterQuery } from "@/hooks/filter";
import type { TransactionRow } from "@/api/types";
import { API_CONFIG, COLUMNS, SORT_CONFIG, TRANSACTION_FILTERS } from "./config";

const QUERY_CONFIG = {
  ...API_CONFIG,
  defaultParams: {
    page: 1,
    limit: 20,
    sortBy: SORT_CONFIG.defaultSortBy,
    sortOrder: SORT_CONFIG.defaultSortOrder,
    searchTerm: "",
    filters: [],
  },
};

export function TransactionsTable() {
  const [selectedRow, setSelectedRow] = useState<TransactionRow | null>(null);

  const {
    data, total, page, totalPages,
    isLoading, hasLoaded, error,
    filterOptions, params,
    setFilter, clearFilters, setSort, setPage,
  } = useFilterQuery<TransactionRow>(QUERY_CONFIG);

  return (
    <>
      {/* <Card className="gap-0 py-0"> */}
      <Card >
        <CardHeader >
          <FilterPanel
            filters={TRANSACTION_FILTERS}
            filterOptions={filterOptions}
            params={params}
            setFilter={setFilter}
            clearFilters={clearFilters}
          />
          <ExportButton disabled={isLoading} />
        </CardHeader>

        <CardContent className="p-0 relative">
          {/* <CardContent > */}
          {isLoading && hasLoaded && (
            <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] rounded-b-xl" />
          )}
          <DataTable
            columns={COLUMNS}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
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
          <CardFooter >
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
