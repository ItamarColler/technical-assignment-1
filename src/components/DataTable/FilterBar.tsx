import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterDTO, FilterNode } from "./types";

interface FilterPanelProps {
  filters: FilterNode[];
  filterOptions: Record<string, string[]>;
  params: FilterDTO;
  setFilter: (filter: FilterNode) => void;
  clearFilters: () => void;
}


export function FilterPanel({
  filters,
  filterOptions,
  params,
  setFilter,
  clearFilters,
}: FilterPanelProps) {
  const hasActive = params.filters.some(f => f.value);

  return (
    <div className="flex flex-wrap items-center gap-2">
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
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              {activeValue && (
                <SelectItem value="">
                  <span className="text-muted-foreground">Clear filter</span>
                </SelectItem>
              )}
              {options.length === 0 ? (
                <SelectItem value="" disabled>
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

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <FilterX className="size-3" />
          Clear all
        </Button>
      )}
    </div>
  );
}
