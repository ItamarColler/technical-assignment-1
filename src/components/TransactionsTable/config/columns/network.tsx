import type React from "react";

export const NetworkCell: React.FC<{ network: string | null }> = ({ network }) => (
  <span className="text-xs text-muted-foreground">{network ?? "—"}</span>
);
