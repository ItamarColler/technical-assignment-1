import type { ReactNode } from "react";

export interface Cell<T> {
  key: keyof T & string;
  label: string;
  mobileHidden?: boolean;
  width?: string;
  render: (row: T) => ReactNode;
}
