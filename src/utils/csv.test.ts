import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseQrCsv, buildCsvSummary } from "./csv";
import * as qrModule from "./qr";
import type { QrItem } from "../types/qr";
import { setTestLocale } from "../test/mountWithI18n";

vi.mock("./qr", () => ({
  createQrItem: vi.fn(),
}));

describe("csv util", () => {
  beforeEach(() => {
    setTestLocale("en");
  });

  describe("parseQrCsv", () => {
    it("throws if CSV lacks 'link' column", async () => {
      await expect(parseQrCsv("caption\nAlgo")).rejects.toThrow(
        "CSV must contain a Link column.",
      );
    });

    it("parses correctly format", async () => {
      const createQrItemMock = vi.mocked(qrModule.createQrItem);

      createQrItemMock.mockImplementation(async (link, legenda) => {
        return {
          link,
          legenda,
          dataUrl: "blob:mock",
          bytes: new Uint8Array(),
          fileBaseName: "mock",
          id: "1",
        } as unknown as QrItem;
      });

      const csv = `link,caption\nhttps://example.com,Meu site\n\n`;
      const result = await parseQrCsv(csv);

      expect(result.ignoredRows).toBe(0);
      expect(result.parserErrors).toBe(0);
      expect(result.items.length).toBe(1);
      expect(result.items[0]).toEqual(
        expect.objectContaining({ link: "https://example.com", legenda: "Meu site" }),
      );
    });

    it("reports progress and ignored invalid rows", async () => {
      const createQrItemMock = vi.mocked(qrModule.createQrItem);
      const progress: Array<{
        processedRows: number;
        totalRows: number;
        generatedCount: number;
        ignoredRows: number;
      }> = [];

      createQrItemMock.mockImplementation(async (link, legenda) => {
        return {
          link,
          legenda,
          dataUrl: "blob:mock",
          bytes: new Uint8Array(),
          fileBaseName: "mock",
          id: link,
        } as QrItem;
      });

      const result = await parseQrCsv(
        "Link,Caption\nexample.com,Example\nbad link,Bad\n\\\\server\\share,Files",
        (step) => progress.push(step),
      );

      expect(result.items.map((item) => item.link)).toEqual([
        "https://example.com",
        "\\\\server\\share",
      ]);
      expect(result.ignoredRows).toBe(1);
      expect(progress).toEqual([
        { processedRows: 0, totalRows: 3, generatedCount: 0, ignoredRows: 0 },
        { processedRows: 1, totalRows: 3, generatedCount: 1, ignoredRows: 0 },
        { processedRows: 2, totalRows: 3, generatedCount: 1, ignoredRows: 1 },
        { processedRows: 3, totalRows: 3, generatedCount: 2, ignoredRows: 1 },
      ]);
    });

    it("accepts localized and normalized headers", async () => {
      const createQrItemMock = vi.mocked(qrModule.createQrItem);

      setTestLocale("pt-BR");
      createQrItemMock.mockImplementation(async (link, legenda) => {
        return {
          link,
          legenda,
          dataUrl: "blob:mock",
          bytes: new Uint8Array(),
          fileBaseName: "mock",
          id: "1",
        } as QrItem;
      });

      const result = await parseQrCsv("\uFEFFLínk,Legenda\nexample.com,Meu site");

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          link: "https://example.com",
          legenda: "Meu site",
        }),
      );
    });
  });

  describe("buildCsvSummary", () => {
    it("returns correct no valid links summary", () => {
      expect(buildCsvSummary(0, 1, 0)).toBe(
        "No valid link or path found in the CSV.",
      );
    });

    it("builds multi-part string", () => {
      const summary = buildCsvSummary(2, 1, 1);
      expect(summary).toBe("2 QRs loaded. 1 row ignored. 1 read warning.");
    });

    it("handles singular names", () => {
      const summary = buildCsvSummary(1, 0, 0);
      expect(summary).toBe("1 QR loaded.");
    });
  });
});
