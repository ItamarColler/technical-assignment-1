# Bloxtax — Project Plan

> **Assignment:** Build a single-page application that renders crypto transaction data stored in the provided SQLite database.

---

## Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Runtime  | [Bun](https://bun.sh) ≥ 1.3                     |
| Frontend | React 19, served via `Bun.serve()` HTML imports |
| Styling  | Tailwind CSS v4, shadcn/ui primitives           |
| Database | SQLite via `bun:sqlite` + Drizzle ORM           |
| Bundler  | Built into Bun — no Vite or Webpack             |

---

## Features

| #   | Feature                              | Priority     | Status                                     |
| --- | ------------------------------------ | ------------ | ------------------------------------------ |
| 1   | Server-side paginated data table     | Required     | ✅ Done                                    |
| 2   | Excel export (zero third-party deps) | Required     | ✅ Done                                    |
| 3   | Responsive layout                    | Required     | ✅ Done (overflow-x-auto + hidden columns) |
| 4   | Multi-column sorting                 | Nice to have | ✅ Done                                    |
| 5   | Column filtering + text search       | Nice to have | ✅ Done                                    |

---

## Implementation Phases

### Phase 1 — Backend API

Expose a paginated, sortable, and filterable transactions endpoint, plus a full-dataset export endpoint.

**Status:** ✅ Complete

#### New files

| File                               | Role                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/api/types.ts`                 | Shared TS types: `TransactionColumn` allowlist union, `ParsedQueryParams`, `PaginatedResponse` |
| `src/api/lib/validation.ts`        | Parses + validates URL query params; enforces `sortBy` allowlist, clamps `limit`               |
| `src/api/lib/queryBuilder.ts`      | Builds Drizzle queries from validated params; runs count + data queries in parallel            |
| `src/api/lib/xlsx.ts`              | XLSX module interface stub (Phase 4 impl); returns 501 until then                              |
| `src/api/handlers/transactions.ts` | `GET /api/transactions` handler (thin orchestrator)                                            |
| `src/api/handlers/export.ts`       | `GET /api/transactions/export` handler (route stub)                                            |

#### Modified files

| File           | Change                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| `src/index.ts` | Add two new route entries for `/api/transactions` and `/api/transactions/export` |

#### Endpoints

| Endpoint                       | Params                                                                                       | Response                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `GET /api/transactions`        | `page`, `limit`, `sortBy`, `sortOrder`, `filter[method\|network\|buyCurrency\|sellCurrency]` | `{ data, total, page, totalPages }`         |
| `GET /api/transactions/export` | none                                                                                         | `.xlsx` binary download (501 until Phase 4) |

#### Implementation order

1. `src/api/types.ts` — zero deps, unblocks everything
2. `src/api/lib/validation.ts` + `bun test` tests
3. `src/api/lib/xlsx.ts` stub
4. `src/api/lib/queryBuilder.ts`
5. `src/api/handlers/transactions.ts`
6. `src/api/handlers/export.ts`
7. Wire routes in `src/index.ts`
8. Run `/security-review`

#### context7 docs to fetch before coding

- `drizzle-orm` → `select from where orderBy limit offset count eq and asc desc bun-sqlite`
- `bun` → `Bun.serve routes URL searchParams TypeScript`

#### Key risks

- `count()` import path in RC2 — fallback: `sql<number>\`count(\*)\`.mapWith(Number)`
- `transactions[params.sortBy]` indexing under `noUncheckedIndexedAccess` — may need cast or map lookup
- `and(...[])` with zero filters returns `undefined` — correct Drizzle behavior, verify in RC2

---

### Phase 2 — Data Table UI

Render transactions in a table with pagination controls, sort headers, and per-column filters.

**Status:** ✅ Complete

#### Key files

| File                                                         | Role                                                                                                                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/formatters.ts`                                      | Pure display formatters: `formatDate`, `formatAmount`, `truncateHash`                                                                                      |
| `src/hooks/filter.ts`                                        | `useFilterQuery<T>` — generic fetch hook; owns `params` state, exposes `setFilter`, `clearFilters`, `setSort`, `setPage`; debounce 300ms + AbortController |
| `src/hooks/filter.utils.ts`                                  | `buildFilterUrl(baseUrl, params)`, `fetchFilterOptions(url, set, signal)`                                                                                  |
| `src/components/DataTable/types.ts`                          | `Cell<T>`, `FilterDTO`, `FilterNode`, `SortOrder`                                                                                                          |
| `src/components/DataTable/DataTable.tsx`                     | Generic table; calls `col.render(row)`; sort handled via `sortBy`/`sortOrder` props                                                                        |
| `src/components/DataTable/FilterBar.tsx`                     | Controlled dropdowns; props: `setFilter(key, label, value)`, `clearFilters()`                                                                              |
| `src/components/TransactionsTable/TransactionsTable.tsx`     | Thin orchestrator — no local state; wires hook setters directly to children                                                                                |
| `src/components/TransactionsTable/config/columns.config.tsx` | `COLUMNS: Cell<TransactionRow>[]` — maps each column to its cell component                                                                                 |
| `src/components/TransactionsTable/config/columns/`           | One file per cell component: `DateCell`, `MethodCell`, `NetworkCell`, `BuyAmountCell`, `SellAmountCell`, `FeeAmountCell`, `TxHashCell`                     |
| `src/components/TransactionsTable/config/filter.config.ts`   | `TRANSACTION_FILTERS`, `SORT_CONFIG`, `API_CONFIG` (env-backed URLs)                                                                                       |
| `src/components/pagination.tsx`                              | Page controls with smart ellipsis + "X–Y of Z" label                                                                                                       |
| `src/components/ExportButton.tsx`                            | Amber outline button → `/api/transactions/export` download                                                                                                 |

#### Conventions

- **Sort:** `FilterDTO` uses explicit `sortBy: string` + `sortOrder: "asc" | "desc"` — no `"-date"` prefix encoding
- **Columns:** `Cell<T>` with `key: keyof T & string`; `render(row)` receives full row; no `getValue`
- **Column files:** PascalCase named exports (`DateCell`, not `DATE_COLUMN`), self-contained with all styles inline
- **Hook config:** `QUERY_CONFIG` declared at module scope (stable reference); URLs sourced from `.env` via `API_CONFIG`
- **Imports:** all config exports surface through `./config` barrel; all cell components through `./columns` barrel

---

### Phase 3 — Responsive Layout

Ensure the page is usable on both desktop and mobile viewports using Tailwind v4 responsive utilities.

**Status:** ⬜ Not started

---

### Phase 4 — Zero-Dependency Excel Export

Implement XLSX file generation from scratch — no `xlsx`, `exceljs`, `sheetjs`, or similar libraries.

**Status:** ✅ Complete

#### Architecture (post-refactor)

| File | Role |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `src/api/lib/excel/excel.types.ts` | `CellType`, `ColumnDef<T>` — shared types |
| `src/api/lib/excel/xlsx.ts` | `ExcelFactory<M extends SQLiteTable>` — generic XLSX generator class |
| `src/api/lib/excel/zip/zip.types.ts` | `ZipEntry` interface |
| `src/api/lib/excel/zip/zip.ts` | `ZipBuilder` — fluent ZIP assembler with `static crc32` |
| `src/api/lib/excel/zip/index.ts` | Barrel re-export |
| `src/api/lib/excel/transactions/config.ts` | `TRANSACTION_COLUMNS` + `transactionExcelFactory` singleton |

**Design patterns applied:**
- **`ExcelFactory<M>`** — constructor takes `(table: M, columns: ColumnDef<InferSelectModel<M>>[])`. All XML builders (`buildContentTypes`, `buildRels`, `buildWorkbook`, `buildWorkbookRels`, `buildStyles`, `buildSheet`, `renderCell`, `msToExcelSerial`, `xmlEscape`, `cellAddr`, `colLetter`) are private. Single public method: `generate(rows, sheetName?)`.
- **`ZipBuilder`** — utility class with fluent `add(name, content)` → `build()`. `crc32` is a `static` method. `CRC_TABLE`, `u16`, `u32` are private statics. `ZipEntry` lives in `zip.types.ts`.
- **Strategy cell rendering** — `ColumnDef<T>.type` drives `renderCell` dispatch; no magic index constants.
- **Configured singleton** — `transactionExcelFactory = new ExcelFactory(transactions, TRANSACTION_COLUMNS)`; callers never instantiate directly.

---

### Phase 5 — Polish & Review

Code quality pass (`/simplify`), security review of API inputs (`/security-review`), and manual QA.

**Status:** ⬜ Not started

---

## Tools & Agents

### Skills

| Skill              | When                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `context7` MCP     | Before each phase — fetch live Drizzle, Bun, React 19, Tailwind v4 docs |
| `/simplify`        | After implementation — review code quality and reuse                    |
| `/security-review` | After implementation — check API filter/sort inputs for injection       |

### Agents

| Agent                    | Type                | Run        | Purpose                                                           |
| ------------------------ | ------------------- | ---------- | ----------------------------------------------------------------- |
| XLSX format research     | `general-purpose`   | Background | Fetch OOXML minimal spec + ZIP binary format                      |
| Drizzle v1 RC2 API check | `claude-code-guide` | Background | Verify `drizzle-orm@1.0.0-rc.2` pre-release filtering/sorting API |
| UI component audit       | `Explore`           | Foreground | Inventory `src/components/ui/` available shadcn primitives        |

---

## References

- **Requirements & Build Plan memory**
  `C:\Users\user\.claude\projects\C--Users-user-Visual-Studio-Code-technical-assignment\memory\project_build_plan.md`

---

## Filter & Sort Architecture

### Multi-column sort

- **`SortEntry`** `{ by: string; order: "asc" | "desc" }` — replaces the old `sortBy + sortOrder` pair everywhere
- **URL format:** single comma-separated param `sort=date:desc,method:asc`; backend splits on `,`
- **DataTable UX:** sort button (label + icon) toggles asc↔desc and adds column if not yet active; `×` button on the right side of the header removes that column from sort; no tri-state, no clickable dead space in header; amber background + bottom border on active headers
- **`setSort(SortEntry[])`** in hook guards against empty array — falls back to `defaultParams.sort`
- **`clearFilters()`** resets sort + searchTerm + filters all together

### Text search

- **`searchTerm: string`** in `FilterDTO`; URL param `searchTerm=...`
- **Backend:** `FilterFactory.buildConditions` applies `OR LIKE '%term%'` across each entry in `searchFields`; combined with AND filter conditions
- **Transactions search fields:** `comments`, `senderAddress`, `receiverAddress`
- **Frontend:** debounced controlled `<Input>` in `FilterPanel`; clears via `×` button; amber border when active; syncs with `searchTerm` prop on external reset

### FilterFactory search config

Defined per-factory in the constructor via `FilterData.searchFields: string[]`:

```ts
// src/api/lib/filter/transactions/config.ts
export const searchFields = ["comments", "senderAddress", "receiverAddress"];
```

`FilterFactory.buildConditions(nodes, searchTerm?)` builds `or(like(col, '%term%'), ...)` when `searchTerm` is present.

### Generic filter URL parsing

`parseQueryParams` extracts all `filter[key]=value` params dynamically via regex — not hardcoded per field. Adding a new filterable column requires no changes to `validation.ts`.

### FilterPanel `hasActive`

Computed in the consumer (`TransactionsTable`), not inside `FilterPanel`:

```ts
const hasActive =
  params.filters.some((f) => f.value) ||
  params.searchTerm.length > 0 ||
  hasUserSort;
```

Passed as `hasActive` prop — enables "Clear all" to light up when the user has applied any sort, filter, or search. `hasUserSort` is a boolean flag from `useFilterQuery`, set to `true` when `setSort` is called with a non-empty array and reset to `false` by `clearFilters`.

---

## Progress Log

| Date       | Update                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-07 | Plan created — ready to implement                                                                                                             |
| 2026-05-07 | Phase 1 backend plan completed — 6 new files, 1 modified, implementation order defined                                                        |
| 2026-05-07 | Phase 2 data table UI complete — 5 new files, 4 modified                                                                                      |
| 2026-05-10 | Filter enhancements — text search, multi-column sort, generic URL parsing, FilterFactory searchFields, feeCurrency filter added               |
| 2026-05-10 | Comments column replaces txHash; sort UX changed to binary toggle + × remove; sort URL changed to comma-separated; pagination limit set to 50 |
| 2026-05-10 | Phase 4 XLSX export complete — zip.ts + xlsx.ts + 13 passing tests                                                                            |
| 2026-05-10 | Refactored excel layer — ExcelFactory\<M\> class, ZipBuilder utility class, excel.types.ts, zip/ directory; 8 tests passing                    |
