import { test, expect, describe } from "bun:test";
import { TransactionExcelFactory } from "./transactions";
import type { TransactionRow } from "../../types";

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

describe("TransactionExcelFactory.Instance.generate", () => {
  test("returns Uint8Array", async () => {
    const bytes = await TransactionExcelFactory.Instance.generate([]);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });

  test("starts with ZIP local file header signature (PK\\x03\\x04)", async () => {
    const bytes = await TransactionExcelFactory.Instance.generate([]);
    expect(bytes[0]).toBe(0x50); // P
    expect(bytes[1]).toBe(0x4b); // K
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
  });

  test("contains EOCD signature (PK\\x05\\x06) near the end", async () => {
    const bytes = await TransactionExcelFactory.Instance.generate([]);
    const tail = bytes.slice(bytes.length - 22);
    const view = new DataView(tail.buffer, tail.byteOffset);
    expect(view.getUint32(0, true)).toBe(0x06054b50);
  });

  test("raw bytes contain '[Content_Types]'", async () => {
    const bytes = await TransactionExcelFactory.Instance.generate([]);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("[Content_Types]");
  });

  test("raw bytes contain 'Transactions' sheet name", async () => {
    const bytes = await TransactionExcelFactory.Instance.generate([], "Transactions");
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Transactions");
  });

  test("smoke test — single row produces meaningful output", async () => {
    const bytes = await TransactionExcelFactory.Instance.generate([sampleRow]);
    expect(bytes.length).toBeGreaterThan(500);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Swap");
    expect(text).toContain("Ethereum");
  });

  test("smoke test — empty rows produces valid ZIP with headers only", async () => {
    const bytes = await TransactionExcelFactory.Instance.generate([]);
    expect(bytes.length).toBeGreaterThan(200);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("Buy Amount");
  });

  test("XML-special characters in values are escaped", async () => {
    const row: TransactionRow = {
      ...sampleRow,
      comments: "<script>alert('xss')</script> & more",
    };
    const bytes = await TransactionExcelFactory.Instance.generate([row]);
    const text = new TextDecoder().decode(bytes);
    expect(text).not.toContain("<script>");
    expect(text).toContain("&lt;script&gt;");
    expect(text).toContain("&amp;");
  });
});
