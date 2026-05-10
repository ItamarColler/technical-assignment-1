import { useState, useEffect, useRef } from "react";
import { FilterX, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  filterOptions: Record<string, string[]>;
  params: FilterDTO;
  setFilter: (filter: FilterNode) => void;
  clearFilters: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  searchPlaceholder?: string;
}


export function FilterPanel({
  filters,
  filterOptions,
  params,
  setFilter,
  clearFilters,
  searchTerm,
  setSearchTerm,
  searchPlaceholder = "Search…",
}: FilterPanelProps) {
  const [inputValue, setInputValue] = useState(searchTerm);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync controlled input when searchTerm resets externally (e.g. clearFilters)
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  function handleInputChange(val: string) {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(val), 300);
  }

  const hasActive = params.filters.some(f => f.value) || searchTerm.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search input */}
      <div className="relative flex items-center min-w-[200px] flex-1">
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

      {/* Dropdown filters */}
      {filters.map(f => {
        const activeNode = params.filters.find(n => n.key === f.key);
        const activeValue = activeNode?.value;
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
              {/* Non-clickable empty anchor — visual start-of-list marker */}
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
      })}

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
  );
}
