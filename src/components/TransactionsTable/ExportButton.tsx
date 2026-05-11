import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FilterDTO } from "@/api/lib/filter/filter.types";
import { buildExportUrl } from "@/hooks/filterUtils";

interface ExportButtonProps {
  disabled?: boolean;
  params: FilterDTO;
  exportUrl: string;
}

export function ExportButton({ disabled, params, exportUrl }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    window.location.href = buildExportUrl(exportUrl, params);
    setTimeout(() => setExporting(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || exporting}
      onClick={handleExport}
      title="Export to Excel"
      className="gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-400/60 disabled:border-border disabled:text-muted-foreground"
    >
      <Download className="size-3.5 shrink-0" />
      <span className="hidden sm:inline">{exporting ? "Exporting…" : "Export XLSX"}</span>
    </Button>
  );
}
