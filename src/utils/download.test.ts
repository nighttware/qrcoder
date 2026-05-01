import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadQrItems } from "./download";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import type { QrItem } from "../types/qr";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  save: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  writeFile: vi.fn(),
}));

describe("download util", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockItem: QrItem = {
    id: "1",
    link: "http://example.com",
    legenda: "test",
    dataUrl: "data:image/png;base64,...",
    bytes: new Uint8Array([1, 2, 3]),
    fileBaseName: "test",
  };

  it("returns false for empty list", async () => {
    expect(await downloadQrItems([])).toBe(false);
  });

  describe("Tauri runtime", () => {
    beforeEach(() => {
      (window as any).__TAURI_INTERNALS__ = true;
    });

    afterEach(() => {
      delete (window as any).__TAURI_INTERNALS__;
    });

    it("downloads single item", async () => {
      vi.mocked(save).mockResolvedValueOnce("/path/to/test.png");
      
      const result = await downloadQrItems([mockItem]);
      
      expect(result).toBe(true);
      expect(save).toHaveBeenCalledWith({
        defaultPath: "test.png",
        filters: [{ name: "PNG", extensions: ["png"] }]
      });
      expect(writeFile).toHaveBeenCalledWith("/path/to/test.png", mockItem.bytes);
    });

    it("returns false if save is cancelled", async () => {
      vi.mocked(save).mockResolvedValueOnce(null);
      
      const result = await downloadQrItems([mockItem]);
      
      expect(result).toBe(false);
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe("Web runtime", () => {
    let mockRevokeObjectURL: any;
    let mockCreateObjectURL: any;
    
    beforeEach(() => {
      mockCreateObjectURL = vi.fn(() => "blob:test");
      mockRevokeObjectURL = vi.fn();
      
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    it("downloads multiple items as ZIP using browser fallback", async () => {
      const clickMock = vi.fn();
      const mockElement = { click: clickMock } as any;
      vi.spyOn(document, "createElement").mockReturnValue(mockElement);

      const result = await downloadQrItems([mockItem, { ...mockItem, fileBaseName: "test2" }]);
      
      expect(result).toBe(true);
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockElement.download).toBe("qrcodes.zip");
      expect(mockElement.href).toBe("blob:test");
      expect(clickMock).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
  });
});
