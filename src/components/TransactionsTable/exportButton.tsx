import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FilterDTO } from "@/api/lib/filter/filter.types";
import { buildExportUrl } from "@/hooks/filter.utils";

interface ExportButtonProps {
  disabled?: boolean;
  params: FilterDTO;
  exportUrl: string;
}

export function ExportButton({ disabled, params, exportUrl }: ExportButtonProps) {
  function handleExport() {
    window.location.href = buildExportUrl(exportUrl, params);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={handleExport}
      className="gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-400/60 disabled:border-border disabled:text-muted-foreground"
    >
      <Download className="size-3.5" />
      Export XLSX
    </Button>
  );
}
