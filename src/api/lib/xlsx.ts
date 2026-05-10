import type { TransactionRow } from "../types";
import { buildZip } from "./zip";

export { crc32 } from "./zip";

// Days between Excel epoch (1899-12-30) and Unix epoch (1970-01-01)
const EXCEL_EPOCH_OFFSET = 25569;

export function msToExcelSerial(date: Date | number): number {
  const ms = date instanceof Date ? date.getTime() : date;
  return ms / 86400000 + EXCEL_EPOCH_OFFSET;
}

function colLetter(col: number): string {
  let s = "";
  let n = col;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function cellAddr(col: number, row: number): string {
  return colLetter(col) + String(row);
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// --- Static XML builders ---

function buildContentTypes(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function buildRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function buildWorkbook(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Transactions" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function buildWorkbookRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function buildStyles(): string {
  // xf index 0 = default, 1 = date (numFmtId 164 = "yyyy-mm-dd"), 2 = bold header
  // fills must have ≥2 entries (Excel invariant: index 0=none, index 1=gray125)
  // numFmtId ≥164 for custom formats (0-163 are built-in reserved)
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1">
    <numFmt numFmtId="164" formatCode="yyyy-mm-dd"/>
  </numFmts>
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0"   fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
    <xf numFmtId="0"   fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;
}

// --- Dynamic sheet builder ---

const HEADERS = [
  "ID", "Method", "Buy Amount", "Buy Currency", "Buy Token",
  "Sell Amount", "Sell Currency", "Sell Token",
  "Fee Amount", "Fee Currency", "Fee Token",
  "Date", "Tx Hash", "Block Height", "Network",
  "Smart Contract", "Sender Address", "Receiver Address", "Comments",
];

// Date is at column index 11 (column L)
const DATE_COL = 11;

function buildSheet(rows: TransactionRow[]): string {
  const parts: string[] = [];
  parts.push(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`
  );

  // Header row (bold, s="2")
  parts.push(`<row r="1">`);
  for (let c = 0; c < HEADERS.length; c++) {
    const addr = cellAddr(c, 1);
    parts.push(`<c r="${addr}" t="inlineStr" s="2"><is><t>${xmlEscape(HEADERS[c] ?? "")}</t></is></c>`);
  }
  parts.push(`</row>`);

  // Data rows
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const rowNum = r + 2;
    parts.push(`<row r="${rowNum}">`);

    const values: (string | number | null | undefined | Date)[] = [
      row.id,
      row.method,
      row.buyAmount,
      row.buyCurrency,
      row.buyToken,
      row.sellAmount,
      row.sellCurrency,
      row.sellToken,
      row.feeAmount,
      row.feeCurrency,
      row.feeToken,
      row.date,
      row.txHash,
      row.blockHeight,
      row.network,
      row.smartContract,
      row.senderAddress,
      row.receiverAddress,
      row.comments,
    ];

    for (let c = 0; c < values.length; c++) {
      const addr = cellAddr(c, rowNum);
      const val = values[c];

      if (val === null || val === undefined) {
        parts.push(`<c r="${addr}"/>`);
      } else if (c === DATE_COL) {
        const serial = msToExcelSerial(val as Date | number);
        parts.push(`<c r="${addr}" s="1"><v>${serial}</v></c>`);
      } else if (typeof val === "number") {
        parts.push(`<c r="${addr}"><v>${val}</v></c>`);
      } else {
        parts.push(`<c r="${addr}" t="inlineStr"><is><t>${xmlEscape(String(val))}</t></is></c>`);
      }
    }

    parts.push(`</row>`);
  }

  parts.push(`</sheetData></worksheet>`);
  return parts.join("");
}

// --- Public API ---

export async function generateXlsx(rows: TransactionRow[]): Promise<Uint8Array> {
  const enc = new TextEncoder();
  return buildZip([
    { name: "[Content_Types].xml",        data: enc.encode(buildContentTypes()) },
    { name: "_rels/.rels",                data: enc.encode(buildRels()) },
    { name: "xl/workbook.xml",            data: enc.encode(buildWorkbook()) },
    { name: "xl/_rels/workbook.xml.rels", data: enc.encode(buildWorkbookRels()) },
    { name: "xl/worksheets/sheet1.xml",   data: enc.encode(buildSheet(rows)) },
    { name: "xl/styles.xml",             data: enc.encode(buildStyles()) },
  ]);
}
