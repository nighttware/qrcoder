import { describe, it, expect, vi, beforeEach } from "vitest";
import { createQrItem } from "./qr";
import * as qrcode from "qrcode";
import * as files from "./files";

vi.mock("qrcode", () => ({
  toCanvas: vi.fn(),
}));

vi.mock("./files", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...(mod as any),
    makeId: vi.fn(() => "mock-id-123"),
    buildFileBaseName: vi.fn(() => "mock-basename"),
  };
});

describe("qr util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createQrItem", () => {
    it("creates item properly", async () => {
      // Mock Canvas and DOM elements since we run in jsdom
      const measureTextMock = vi.fn(() => ({ width: 50 }));
      const fillTextMock = vi.fn();
      const fillRectMock = vi.fn();
      const drawImageMock = vi.fn();

      const mockCtx = {
        measureText: measureTextMock,
        fillText: fillTextMock,
        fillRect: fillRectMock,
        drawImage: drawImageMock,
      } as any;

      const mockCanvas = {
        getContext: vi.fn(() => mockCtx),
        toDataURL: vi.fn(() => "data:image/png;base64,mock"),
        width: 0,
        height: 0,
      } as any;

      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas);

      const mockResponse = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as any;
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const item = await createQrItem("http://test.com", "Test Legend", 1);
      
      expect(item.id).toBe("mock-id-123");
      expect(item.link).toBe("http://test.com");
      expect(item.legenda).toBe("Test Legend");
      expect(item.dataUrl).toBe("data:image/png;base64,mock");
      expect(item.fileBaseName).toBe("mock-basename");
      
      expect(qrcode.toCanvas).toHaveBeenCalled();
      expect(files.buildFileBaseName).toHaveBeenCalledWith("http://test.com", "Test Legend", 1);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png");
    });
  });
});
