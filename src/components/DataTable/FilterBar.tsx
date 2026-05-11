import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, FilterX, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterNode, FilterDTO } from "@/api/lib/filter/filter.types";


interface FilterPanelProps {
  filters: FilterNode[];
  advancedFilters?: FilterNode[];
  filterOptions: Record<string, string[]>;
  params: FilterDTO;
  setFilter: (filter: FilterNode) => void;
  clearFilters: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  searchPlaceholder?: string;
  hasActive: boolean;
  dateFrom?: string;
  dateTo?: string;
  setDateFrom?: (val: string) => void;
  setDateTo?: (val: string) => void;
  filtersOpen?: boolean;
  onFiltersOpenChange?: (open: boolean) => void;
  onAdvancedOpenChange?: (open: boolean) => void;
}


export function FilterPanel({
  filters,
  advancedFilters,
  filterOptions,
  params,
  setFilter,
  clearFilters,
  searchTerm,
  setSearchTerm,
  searchPlaceholder = "Search…",
  hasActive,
  dateFrom = "",
  dateTo = "",
  setDateFrom,
  setDateTo,
  filtersOpen = false,
  onFiltersOpenChange,
  onAdvancedOpenChange,
}: FilterPanelProps) {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeAdvancedCount = (advancedFilters?.filter(
    f => params.filters.find(n => n.key === f.key)?.value
  ).length ?? 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  // Sync controlled input when searchTerm resets externally (e.g. clearFilters)
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  function handleInputChange(val: string) {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(val), 300);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: search + mobile filter toggle — always visible */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center min-w-0 flex-1">
          <Search className="absolute left-2 size-3 text-muted-foreground pointer-events-none" />
          <Input
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "h-7 text-xs pl-7 pr-7",
              inputValue.length > 0
                ? "border-amber-500/50 text-amber-400"
                : "text-muted-foreground"
            )}
          />
          {inputValue.length > 0 && (
            <button
              type="button"
              onClick={() => handleInputChange("")}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Filter toggle — mobile only */}
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => onFiltersOpenChange?.(!filtersOpen)}
          className={cn(
            "sm:hidden h-7 gap-1.5 text-xs shrink-0",
            hasActive
              ? "border-amber-500/50 text-amber-400"
              : "text-muted-foreground"
          )}
        >
          <FilterX className="size-3" />
          Filters
          {hasActive && <span className="size-1.5 rounded-full bg-amber-400 shrink-0" />}
        </Button>
      </div>

      {/* Row 2: dropdowns + date range — always on sm+, toggle-controlled on mobile */}
      <div className={cn(
        "flex-wrap items-center gap-2",
        filtersOpen ? "flex" : "hidden sm:flex"
      )}>
        {filters.map(f => (
          <FilterSelect key={f.key} f={f} params={params} filterOptions={filterOptions} setFilter={setFilter} />
        ))}

        {/* Advanced filters toggle */}
        {((advancedFilters && advancedFilters.length > 0) || !!setDateFrom) && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              const next = !advancedOpen;
              setAdvancedOpen(next);
              onAdvancedOpenChange?.(next);
            }}
            className={cn(
              "h-7 gap-1 text-xs",
              activeAdvancedCount > 0
                ? "border-amber-500/50 text-amber-400"
                : "text-muted-foreground"
            )}
          >
            {advancedOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            More{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ""}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={!hasActive}
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <FilterX className="size-3" />
          Clear all
        </Button>
      </div>

      {/* Advanced filters panel */}
      {advancedOpen && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50">
          {advancedFilters?.map(f => (
            <FilterSelect key={f.key} f={f} params={params} filterOptions={filterOptions} setFilter={setFilter} />
          ))}
          <DatePicker
            value={dateFrom}
            onChange={val => setDateFrom?.(val)}
            placeholder="From date"
          />
          <span className="text-muted-foreground text-xs shrink-0">—</span>
          <DatePicker
            value={dateTo}
            onChange={val => setDateTo?.(val)}
            min={dateFrom || undefined}
            placeholder="To date"
          />
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  f,
  params,
  filterOptions,
  setFilter,
}: {
  f: FilterNode;
  params: FilterDTO;
  filterOptions: Record<string, string[]>;
  setFilter: (filter: FilterNode) => void;
}) {
  const activeValue = params.filters.find(n => n.key === f.key)?.value;
  const options = filterOptions[f.key] ?? [];

  return (
    <Select
      key={`${f.key}:${activeValue ?? ""}`}
      defaultValue={activeValue}
      onValueChange={val => setFilter({ ...f, value: val ?? undefined })}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "h-7 text-xs min-w-[110px]",
          activeValue
            ? "border-amber-500/50 text-amber-400"
            : "text-muted-foreground"
        )}
      >
        <SelectValue placeholder={f.title} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__empty__" disabled className="text-muted-foreground/40 italic text-xs">
          —
        </SelectItem>
        {activeValue && (
          <SelectItem value="">
            <span className="text-muted-foreground">Clear filter</span>
          </SelectItem>
        )}
        {options.length === 0 ? (
          <SelectItem value="__no_options__" disabled>
            <span className="italic text-muted-foreground">No options</span>
          </SelectItem>
        ) : (
          options.map(opt => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
