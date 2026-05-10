import { test, expect, describe } from "bun:test";
import { generateXlsx, crc32, msToExcelSerial } from "./xlsx";
import type { TransactionRow } from "../types";

const sampleRow: TransactionRow = {
  id: 1,
  method: "Swap",
  buyAmount: 1.5,
  buyCurrency: "ETH",
  buyToken: "0xabc",
  sellAmount: null,
  sellCurrency: null,
  sellToken: null,
  feeAmount: 0.001,
  feeCurrency: "ETH",
  feeToken: null,
  date: new Date("2024-06-15T10:30:00Z"),
  txHash: "0xdeadbeef",
  blockHeight: "19000000",
  network: "Ethereum",
  smartContract: null,
  senderAddress: "0xfoo",
  receiverAddress: "0xbar",
  comments: null,
};

describe("crc32", () => {
  test("known vector: '123456789' → 0xCBF43926", () => {
    const data = new TextEncoder().encode("123456789");
    expect(crc32(data)).toBe(0xcbf43926);
  });

  test("empty input → 0x00000000", () => {
    expect(crc32(new Uint8Array(0))).toBe(0x00000000);
  });
});

describe("msToExcelSerial", () => {
  test("Unix epoch (1970-01-01) → 25569", () => {
    expect(msToExcelSerial(new Date(0))).toBe(25569);
  });

  test("accepts raw ms number", () => {
    expect(msToExcelSerial(0)).toBe(25569);
  });

  test("2024-01-01 → ~45292", () => {
    const serial = msToExcelSerial(new Date("2024-01-01T00:00:00Z"));
    expect(serial).toBeCloseTo(45292, 0);
  });
});

describe("generateXlsx", () => {
  test("returns Uint8Array", async () => {
    const bytes = await generateXlsx([]);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });

  test("starts with ZIP local file header signature (PK\\x03\\x04)", async () => {
    const bytes = await generateXlsx([]);
    expect(bytes[0]).toBe(0x50); // P
    expect(bytes[1]).toBe(0x4b); // K
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
  });

  test("contains EOCD signature (PK\\x05\\x06) near the end", async () => {
    const bytes = await generateXlsx([]);
    // EOCD is the last 22 bytes when there's no ZIP comment
    const tail = bytes.slice(bytes.length - 22);
    const view = new DataView(tail.buffer, tail.byteOffset);
    expect(view.getUint32(0, true)).toBe(0x06054b50);
  });

  test("raw bytes contain '[Content_Types]'", async () => {
    const bytes = await generateXlsx([]);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("[Content_Types]");
  });

  test("raw bytes contain 'Transactions' sheet name", async () => {
    const bytes = await generateXlsx([]);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Transactions");
  });

  test("smoke test — single row produces meaningful output", async () => {
    const bytes = await generateXlsx([sampleRow]);
    expect(bytes.length).toBeGreaterThan(500);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Swap");
    expect(text).toContain("Ethereum");
  });

  test("smoke test — empty rows produces valid ZIP with headers only", async () => {
    const bytes = await generateXlsx([]);
    expect(bytes.length).toBeGreaterThan(200);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Buy Amount");
  });

  test("XML-special characters in values are escaped", async () => {
    const row: TransactionRow = {
      ...sampleRow,
      comments: "<script>alert('xss')</script> & more",
    };
    const bytes = await generateXlsx([row]);
    const text = new TextDecoder().decode(bytes);
    expect(text).not.toContain("<script>");
    expect(text).toContain("&lt;script&gt;");
    expect(text).toContain("&amp;");
  });
});
