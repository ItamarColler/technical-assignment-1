export type CellType = "text" | "number" | "date";

export interface ColumnDef<T> {
  header: string;
  getValue: (row: T) => string | number | Date | null | undefined;
  type: CellType;
  width?: number;
}

export interface ExportMetadata {
  generatedAt: string;
  filters: string;
}
