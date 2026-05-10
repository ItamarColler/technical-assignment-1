import type React from "react";

export const CommentsCell: React.FC<{ comments: string | null }> = ({ comments }) => (
  <span
    className="text-xs text-muted-foreground truncate block"
    title={comments ?? undefined}
  >
    {comments ?? "—"}
  </span>
);
