import type { TransactionRow } from "@/api/types";

export const CommentsCell = ({ comments }: Pick<TransactionRow, "comments">) => (
  <span
    className="text-xs text-muted-foreground truncate block"
    title={comments ?? undefined}
  >
    {comments ?? "—"}
  </span>
);
