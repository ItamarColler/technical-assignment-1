import type { ReactNode } from "react";

export interface CellContext {
  tabletHidden?: boolean; // hidden below sm (640px)
  wideOnly?: boolean;     // hidden below md (768px)
  desktopOnly?: boolean;  // hidden below lg (1024px)
  colClassName?: string;  // classes on the <col> element — width (w-[Xpx]) and any overrides
  colWidth?: number;
}

export interface Cell<T> {
  key: keyof T & string;
  label: string;
  ctx?: CellContext;
  render: (row: T, ctx: CellContext) => ReactNode;
}
