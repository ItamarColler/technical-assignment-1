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

**Status:** ✅ Complete

#### What was done

| Area | Change |
|---|---|
| Table columns | `tabletHidden`, `wideOnly`, `desktopOnly` flags hide/show columns per breakpoint via `Cell<T>.ctx` |
| Table scroll | `overflow-x-auto` on the table container — horizontal scroll on narrow screens |
| Transaction dialog | Responsive bento-grid layout — 2-column on ≥ 640 px, single-column on mobile |

#### TransactionDialog responsive refactor

**Files modified:**
- `src/components/ui/dialog.tsx` — popup width: `max-w-lg sm:max-w-2xl md:max-w-3xl`
- `src/components/TransactionsTable/TransactionDialog.tsx` — layout + component changes

**Design:** Sections become grid children in a `grid-cols-1 sm:grid-cols-2` content area. Details spans full width (col-span-2); Buy/Sell pair side-by-side; Fee/Addresses pair side-by-side; Notes spans full width. Lone sections expand to full-width automatically via conditional `span` prop.

**Empty field suppression:** `DialogField` returns `null` when value is falsy — no "—" rows. Buy/Sell/Fee sections collapse entirely when all their fields are null (guarded by `hasBuy`/`hasSell`/`hasFee` booleans). `formatAmountOrNull` helper passes `null` to `DialogField` when amount is absent (vs. `formatAmount` which returns the string `"—"`).

**Component API additions:**
- `DialogSection` — `span?: 1 | 2` (drives `sm:col-span-2`), `innerClassName?: string` (overrides inner div classes for Details inner grid)
- `DialogField` — early-return guard `if (!value) return null`; copy button always rendered when `copyable` and value is present

---

### Phase 4 — Zero-Dependency Excel Export

Implement XLSX file generation from scratch — no `xlsx`, `exceljs`, `sheetjs`, or similar libraries.

**Status:** ✅ Complete

#### Architecture (post-refactor)

| File | Role |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `src/api/lib/excel/excel.types.ts` | `CellType`, `ColumnDef<T>`, `ExportMetadata` — shared types |
| `src/api/lib/excel/xlsx.ts` | `ExcelFactory<M extends SQLiteTable>` — generic XLSX generator class |
| `src/api/lib/excel/zip/zip.types.ts` | `ZipEntry` interface |
| `src/api/lib/excel/zip/zip.ts` | `ZipBuilder` — fluent ZIP assembler with `static crc32` |
| `src/api/lib/excel/zip/index.ts` | Barrel re-export |
| `src/api/lib/excel/transactions/config.ts` | `TRANSACTION_COLUMNS` (18 cols, ID excluded) |
| `src/api/lib/excel/transactions/excel.factory.ts` | `TransactionExcelFactory` singleton (static `get Instance()`) |
| `src/api/handlers/export.ts` | Builds `ExportMetadata` from active filters and passes to `generate()` |

**Design patterns applied:**
- **`ExcelFactory<M>`** — constructor takes `(table: M, columns: ColumnDef<InferSelectModel<M>>[])`. All XML builders are private. Public method: `generate(rows, sheetName?, metadata?)`.
- **`ZipBuilder`** — utility class with fluent `add(name, content)` → `build()`. `crc32` is a `static` method. `CRC_TABLE`, `u16`, `u32` are private statics. `ZipEntry` lives in `zip.types.ts`.
- **Strategy cell rendering** — `ColumnDef<T>.type` drives `renderCell` dispatch; no magic index constants.
- **Configured singleton** — `TransactionExcelFactory.Instance`; callers never instantiate directly.

#### ZIP parts generated per export

| Path | Builder method |
| ---- | -------------- |
| `[Content_Types].xml` | `buildContentTypes()` |
| `_rels/.rels` | `buildRels()` |
| `xl/workbook.xml` | `buildWorkbook()` — includes `<fileVersion>`, `<bookViews>` |
| `xl/_rels/workbook.xml.rels` | `buildWorkbookRels()` |
| `xl/worksheets/sheet1.xml` | `buildSheet()` — metadata rows + freeze pane + tableParts |
| `xl/worksheets/_rels/sheet1.xml.rels` | `buildSheetRels()` |
| `xl/tables/table1.xml` | `buildTable()` — TableStyleMedium2 + autoFilter + tableColumns |
| `xl/styles.xml` | `buildStyles()` — includes `<cellStyles>` with Normal style |

#### Excel interactivity features

- **Native Excel Table** (`xl/tables/table1.xml`) — `TableStyleMedium2`, banded rows, structured references, AutoFilter dropdowns on every column header
- **Freeze pane** — freezes rows 1–`headerRow` so metadata + table header stay pinned while scrolling
- **Column widths** — per-column via `ColumnDef.width` (8–44 units)
- **Export metadata rows** — when `ExportMetadata` is passed, rows 1–2 show "Generated" and "Filters" labels; table starts at row 4; row 3 is an empty visual separator
- **Sheet name** — capped at 31 chars (Excel hard limit) to prevent "Worksheet properties repaired" dialog

#### Known XML correctness rules

- All XML template literals must have content starting at column 0 — source indentation corrupts XML
- `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` must follow `<cellXfs>` — without it Excel repairs styles and blames workbook.xml
- `<fileVersion appName="xl" .../>` must be the first child of `<workbook>`
- `<tableParts>` in worksheet references the table via `r:id`; `<autoFilter>` lives inside `xl/tables/table1.xml`, not in the worksheet

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
| 2026-05-11 | Fixed Excel repair dialogs — XML indentation corruption, missing `<bookViews>`, `<cellStyles>`, `<fileVersion>`, sheet name 31-char overflow |
| 2026-05-11 | Upgraded export to native Excel Table (TableStyleMedium2, banded rows, AutoFilter, freeze pane, column widths) on branch `feat/excel-interactive-autofilter` |
| 2026-05-11 | Added export metadata rows (Generated, Filters) above data table; ID column removed from export (DB-only field) |
| 2026-05-11 | TransactionDialog responsive refactor — bento 2-col grid on wide screens, null field suppression, section collapse when empty |
