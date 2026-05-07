import type { TransactionRow } from "../types";

// Phase 4: implement hand-written OpenXML ZIP+XML generation here.
// No third-party dependencies — uses native CompressionStream (deflate) + manual ZIP binary headers.
export async function generateXlsx(_rows: TransactionRow[]): Promise<Uint8Array> {
  throw new Error("XLSX generation not yet implemented (Phase 4)");
}
