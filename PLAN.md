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

| #   | Feature                              | Priority     | Status         |
| --- | ------------------------------------ | ------------ | -------------- |
| 1   | Server-side paginated data table     | Required     | ✅ Backend done |
| 2   | Excel export (zero third-party deps) | Required     | 🟡 Route stub (Phase 4) |
| 3   | Responsive layout                    | Required     | ⬜ Not started |
| 4   | Column sorting                       | Nice to have | ⬜ Not started |
| 5   | Column filtering                     | Nice to have | ⬜ Not started |

---

## Implementation Phases

### Phase 1 — Backend API

Expose a paginated, sortable, and filterable transactions endpoint, plus a full-dataset export endpoint.

**Status:** ✅ Complete

#### New files
| File | Role |
| --- | --- |
| `src/api/types.ts` | Shared TS types: `TransactionColumn` allowlist union, `ParsedQueryParams`, `PaginatedResponse` |
| `src/api/lib/validation.ts` | Parses + validates URL query params; enforces `sortBy` allowlist, clamps `limit` |
| `src/api/lib/queryBuilder.ts` | Builds Drizzle queries from validated params; runs count + data queries in parallel |
| `src/api/lib/xlsx.ts` | XLSX module interface stub (Phase 4 impl); returns 501 until then |
| `src/api/handlers/transactions.ts` | `GET /api/transactions` handler (thin orchestrator) |
| `src/api/handlers/export.ts` | `GET /api/transactions/export` handler (route stub) |

#### Modified files
| File | Change |
| --- | --- |
| `src/index.ts` | Add two new route entries for `/api/transactions` and `/api/transactions/export` |

#### Endpoints
| Endpoint | Params | Response |
| --- | --- | --- |
| `GET /api/transactions` | `page`, `limit`, `sortBy`, `sortOrder`, `filter[method\|network\|buyCurrency\|sellCurrency]` | `{ data, total, page, totalPages }` |
| `GET /api/transactions/export` | none | `.xlsx` binary download (501 until Phase 4) |

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
- `count()` import path in RC2 — fallback: `sql<number>\`count(*)\`.mapWith(Number)`
- `transactions[params.sortBy]` indexing under `noUncheckedIndexedAccess` — may need cast or map lookup
- `and(...[])` with zero filters returns `undefined` — correct Drizzle behavior, verify in RC2

---

### Phase 2 — Data Table UI

Render transactions in a table with pagination controls, sort headers, and per-column filters.

**Status:** ⬜ Not started

---

### Phase 3 — Responsive Layout

Ensure the page is usable on both desktop and mobile viewports using Tailwind v4 responsive utilities.

**Status:** ⬜ Not started

---

### Phase 4 — Zero-Dependency Excel Export

Implement XLSX file generation from scratch — no `xlsx`, `exceljs`, `sheetjs`, or similar libraries.

**Status:** ⬜ Not started

---

### Phase 5 — Polish & Review

Code quality pass (`/simplify`), security review of API inputs (`/security-review`), and manual QA.

**Status:** ⬜ Not started

---

## Tools & Agents

### Skills
| Skill | When |
| --- | --- |
| `context7` MCP | Before each phase — fetch live Drizzle, Bun, React 19, Tailwind v4 docs |
| `/simplify` | After implementation — review code quality and reuse |
| `/security-review` | After implementation — check API filter/sort inputs for injection |

### Agents
| Agent | Type | Run | Purpose |
| --- | --- | --- | --- |
| XLSX format research | `general-purpose` | Background | Fetch OOXML minimal spec + ZIP binary format |
| Drizzle v1 RC2 API check | `claude-code-guide` | Background | Verify `drizzle-orm@1.0.0-rc.2` pre-release filtering/sorting API |
| UI component audit | `Explore` | Foreground | Inventory `src/components/ui/` available shadcn primitives |

---

## References

- **Requirements & Build Plan memory**
  `C:\Users\user\.claude\projects\C--Users-user-Visual-Studio-Code-technical-assignment\memory\project_build_plan.md`

---

## Progress Log

| Date       | Update                            |
| ---------- | --------------------------------- |
| 2026-05-07 | Plan created — ready to implement |
| 2026-05-07 | Phase 1 backend plan completed — 6 new files, 1 modified, implementation order defined |
