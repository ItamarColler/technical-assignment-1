const CRC_TABLE: Uint32Array = (() => {
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

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (CRC_TABLE[(crc ^ (data[i] ?? 0)) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(view: DataView, offset: number, val: number) {
  view.setUint16(offset, val, true);
}

function u32(view: DataView, offset: number, val: number) {
  view.setUint32(offset, val, true);
}

interface ZipEntry {
  nameBytes: Uint8Array;
  data: Uint8Array;
  crc: number;
  localOffset: number;
}

export function buildZip(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const enc = new TextEncoder();
  const entries: ZipEntry[] = [];

  let dataSize = 0;
  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    dataSize += 30 + nameBytes.length + f.data.length;
    entries.push({ nameBytes, data: f.data, crc: crc32(f.data), localOffset: 0 });
  }

  const cdSize = entries.reduce((s, e) => s + 46 + e.nameBytes.length, 0);
  const totalSize = dataSize + cdSize + 22;

  const buf = new Uint8Array(totalSize);
  const view = new DataView(buf.buffer);
  let pos = 0;

  // Local file headers + data
  for (const entry of entries) {
    entry.localOffset = pos;
    const nl = entry.nameBytes.length;
    const dl = entry.data.length;

    u32(view, pos, 0x04034b50); pos += 4; // signature
    u16(view, pos, 20);         pos += 2; // version needed
    u16(view, pos, 0);          pos += 2; // flags
    u16(view, pos, 0);          pos += 2; // compression: STORED
    u16(view, pos, 0);          pos += 2; // mod time
    u16(view, pos, 0);          pos += 2; // mod date
    u32(view, pos, entry.crc);  pos += 4; // crc-32
    u32(view, pos, dl);         pos += 4; // compressed size
    u32(view, pos, dl);         pos += 4; // uncompressed size
    u16(view, pos, nl);         pos += 2; // name length
    u16(view, pos, 0);          pos += 2; // extra length
    buf.set(entry.nameBytes, pos); pos += nl;
    buf.set(entry.data, pos);      pos += dl;
  }

  // Central directory
  const cdOffset = pos;
  for (const entry of entries) {
    const nl = entry.nameBytes.length;
    const dl = entry.data.length;

    u32(view, pos, 0x02014b50);        pos += 4; // signature
    u16(view, pos, 20);                pos += 2; // version made by
    u16(view, pos, 20);                pos += 2; // version needed
    u16(view, pos, 0);                 pos += 2; // flags
    u16(view, pos, 0);                 pos += 2; // compression
    u16(view, pos, 0);                 pos += 2; // mod time
    u16(view, pos, 0);                 pos += 2; // mod date
    u32(view, pos, entry.crc);         pos += 4; // crc-32
    u32(view, pos, dl);                pos += 4; // compressed size
    u32(view, pos, dl);                pos += 4; // uncompressed size
    u16(view, pos, nl);                pos += 2; // name length
    u16(view, pos, 0);                 pos += 2; // extra length
    u16(view, pos, 0);                 pos += 2; // comment length
    u16(view, pos, 0);                 pos += 2; // disk number start
    u16(view, pos, 0);                 pos += 2; // internal attrs
    u32(view, pos, 0);                 pos += 4; // external attrs
    u32(view, pos, entry.localOffset); pos += 4; // local header offset
    buf.set(entry.nameBytes, pos);     pos += nl;
  }

  // End of central directory
  const n = entries.length;
  u32(view, pos, 0x06054b50); pos += 4; // signature
  u16(view, pos, 0);          pos += 2; // disk number
  u16(view, pos, 0);          pos += 2; // start disk
  u16(view, pos, n);          pos += 2; // entries on disk
  u16(view, pos, n);          pos += 2; // total entries
  u32(view, pos, cdSize);     pos += 4; // cd size
  u32(view, pos, cdOffset);   pos += 4; // cd offset
  u16(view, pos, 0);          pos += 2; // comment length

  return buf;
}
