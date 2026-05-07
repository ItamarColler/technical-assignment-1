import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  disabled?: boolean;
}

export function ExportButton({ disabled }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={() => { window.location.href = "/api/transactions/export"; }}
      className="gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-400/60 disabled:border-border disabled:text-muted-foreground"
    >
      <Download className="size-3.5" />
      Export XLSX
    </Button>
  );
}
