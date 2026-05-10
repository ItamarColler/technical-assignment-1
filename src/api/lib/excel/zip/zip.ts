import type { ZipEntry } from "./zip.types";

export class ZipBuilder {
  private static readonly CRC_TABLE: Uint32Array = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
      }
      t[i] = c;
    }
    return t;
  })();

  private readonly enc = new TextEncoder();
  private readonly entries: ZipEntry[] = [];

  static crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = (ZipBuilder.CRC_TABLE[(crc ^ (data[i] ?? 0)) & 0xff] ?? 0) ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  private static u16(view: DataView, offset: number, val: number): void {
    view.setUint16(offset, val, true);
  }

  private static u32(view: DataView, offset: number, val: number): void {
    view.setUint32(offset, val, true);
  }

  add(name: string, content: string | Uint8Array): this {
    const data = typeof content === "string" ? this.enc.encode(content) : content;
    const nameBytes = this.enc.encode(name);
    this.entries.push({ nameBytes, data, crc: ZipBuilder.crc32(data), localOffset: 0 });
    return this;
  }

  build(): Uint8Array {
    const { entries } = this;

    let dataSize = 0;
    for (const e of entries) {
      dataSize += 30 + e.nameBytes.length + e.data.length;
    }

    const cdSize = entries.reduce((s, e) => s + 46 + e.nameBytes.length, 0);
    const buf = new Uint8Array(dataSize + cdSize + 22);
    const view = new DataView(buf.buffer);
    let pos = 0;

    for (const entry of entries) {
      entry.localOffset = pos;
      const nl = entry.nameBytes.length;
      const dl = entry.data.length;

      ZipBuilder.u32(view, pos, 0x04034b50); pos += 4;
      ZipBuilder.u16(view, pos, 20);         pos += 2;
      ZipBuilder.u16(view, pos, 0);          pos += 2;
      ZipBuilder.u16(view, pos, 0);          pos += 2;
      ZipBuilder.u16(view, pos, 0);          pos += 2;
      ZipBuilder.u16(view, pos, 0);          pos += 2;
      ZipBuilder.u32(view, pos, entry.crc);  pos += 4;
      ZipBuilder.u32(view, pos, dl);         pos += 4;
      ZipBuilder.u32(view, pos, dl);         pos += 4;
      ZipBuilder.u16(view, pos, nl);         pos += 2;
      ZipBuilder.u16(view, pos, 0);          pos += 2;
      buf.set(entry.nameBytes, pos); pos += nl;
      buf.set(entry.data, pos);      pos += dl;
    }

    const cdOffset = pos;
    for (const entry of entries) {
      const nl = entry.nameBytes.length;
      const dl = entry.data.length;

      ZipBuilder.u32(view, pos, 0x02014b50);        pos += 4;
      ZipBuilder.u16(view, pos, 20);                pos += 2;
      ZipBuilder.u16(view, pos, 20);                pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u32(view, pos, entry.crc);         pos += 4;
      ZipBuilder.u32(view, pos, dl);                pos += 4;
      ZipBuilder.u32(view, pos, dl);                pos += 4;
      ZipBuilder.u16(view, pos, nl);                pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u16(view, pos, 0);                 pos += 2;
      ZipBuilder.u32(view, pos, 0);                 pos += 4;
      ZipBuilder.u32(view, pos, entry.localOffset); pos += 4;
      buf.set(entry.nameBytes, pos);                pos += nl;
    }

    const n = entries.length;
    ZipBuilder.u32(view, pos, 0x06054b50); pos += 4;
    ZipBuilder.u16(view, pos, 0);          pos += 2;
    ZipBuilder.u16(view, pos, 0);          pos += 2;
    ZipBuilder.u16(view, pos, n);          pos += 2;
    ZipBuilder.u16(view, pos, n);          pos += 2;
    ZipBuilder.u32(view, pos, cdSize);     pos += 4;
    ZipBuilder.u32(view, pos, cdOffset);   pos += 4;
    ZipBuilder.u16(view, pos, 0);          pos += 2;

    return buf;
  }
}
