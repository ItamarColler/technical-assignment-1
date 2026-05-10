import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";
import type { ColumnDef } from "./excel.types";
import { ZipBuilder } from "./zip";

// Days between Excel epoch (1899-12-30) and Unix epoch (1970-01-01)
const EXCEL_EPOCH_OFFSET = 25569;

export class ExcelFactory<M extends SQLiteTable> {
  protected readonly table: M;
  private readonly columns: ColumnDef<InferSelectModel<M>>[];

  constructor(table: M, columns: ColumnDef<InferSelectModel<M>>[]) {
    this.table = table;
    this.columns = columns;
  }

  async generate(
    rows: InferSelectModel<M>[],
    sheetName = "Sheet1",
  ): Promise<Uint8Array> {
    return new ZipBuilder()
      .add("[Content_Types].xml", this.buildContentTypes())
      .add("_rels/.rels", this.buildRels())
      .add("xl/workbook.xml", this.buildWorkbook(sheetName))
      .add("xl/_rels/workbook.xml.rels", this.buildWorkbookRels())
      .add("xl/worksheets/sheet1.xml", this.buildSheet(rows))
      .add("xl/styles.xml", this.buildStyles())
      .build();
  }

  private buildContentTypes(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
  }

  private buildRels(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  }

  private buildWorkbook(sheetName: string): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheets>
          <sheet name="${this.xmlEscape(sheetName)}" sheetId="1" r:id="rId1"/>
        </sheets>
      </workbook>`;
  }

  private buildWorkbookRels(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
              <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
               <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
                <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
              </Relationships>`;
  }

  private buildStyles(): string {
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

  private buildSheet(rows: InferSelectModel<M>[]): string {
    const parts: string[] = [];
    parts.push(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`,
    );

    parts.push(`<row r="1">`);
    for (let c = 0; c < this.columns.length; c++) {
      const addr = this.cellAddr(c, 1);
      parts.push(
        `<c r="${addr}" t="inlineStr" s="2"><is><t>${this.xmlEscape(this.columns[c]!.header)}</t></is></c>`,
      );
    }
    parts.push(`</row>`);

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;
      const rowNum = r + 2;
      parts.push(`<row r="${rowNum}">`);
      for (let c = 0; c < this.columns.length; c++) {
        const col = this.columns[c]!;
        parts.push(
          this.renderCell(
            col.type,
            col.getValue(row),
            this.cellAddr(c, rowNum),
          ),
        );
      }
      parts.push(`</row>`);
    }

    parts.push(`</sheetData></worksheet>`);
    return parts.join("");
  }

  private renderCell(
    type: ColumnDef<InferSelectModel<M>>["type"],
    val: string | number | Date | null | undefined,
    addr: string,
  ): string {
    if (val === null || val === undefined) return `<c r="${addr}"/>`;
    if (type === "date") {
      const serial = this.msToExcelSerial(val as Date | number);
      return `<c r="${addr}" s="1"><v>${serial}</v></c>`;
    }
    if (type === "number") return `<c r="${addr}"><v>${val}</v></c>`;
    return `<c r="${addr}" t="inlineStr"><is><t>${this.xmlEscape(String(val))}</t></is></c>`;
  }

  private msToExcelSerial(date: Date | number): number {
    const ms = date instanceof Date ? date.getTime() : date;
    return ms / 86400000 + EXCEL_EPOCH_OFFSET;
  }

  private colLetter(col: number): string {
    let s = "";
    let n = col;
    do {
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
  }

  private cellAddr(col: number, row: number): string {
    return this.colLetter(col) + String(row);
  }

  private xmlEscape(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
