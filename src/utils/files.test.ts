import { describe, it, expect } from "vitest";
import { makeId, buildFileBaseName, buildUniqueFileNames } from "./files";
import type { QrItem } from "../types/qr";

describe("files util", () => {
  describe("makeId", () => {
    it("returns string", () => {
      expect(typeof makeId()).toBe("string");
    });
  });

  describe("buildFileBaseName", () => {
    it("returns sanitized legenda if available", () => {
      expect(buildFileBaseName("http://example.com", "Minha Legenda!", 1)).toBe("Minha-Legenda");
    });

    it("returns hostname from URL when legenda is empty", () => {
      expect(buildFileBaseName("http://www.google.com/path", "", 1)).toBe("www.google.com");
    });

    it("returns fallback for invalid URLs and no legenda", () => {
      expect(buildFileBaseName("not a url", "", 5)).toBe("qr-005");
    });
  });

  describe("buildUniqueFileNames", () => {
    it("generates unique paths avoiding overriding", () => {
      const items: QrItem[] = [
        { fileBaseName: "meu-qr", id: "1", link: "", legenda: "", dataUrl: "", bytes: new Uint8Array() },
        { fileBaseName: "meu-qr", id: "2", link: "", legenda: "", dataUrl: "", bytes: new Uint8Array() },
        { fileBaseName: "outro", id: "3", link: "", legenda: "", dataUrl: "", bytes: new Uint8Array() },
      ];
      
      const names = buildUniqueFileNames(items);
      expect(names).toEqual(["meu-qr.png", "meu-qr-2.png", "outro.png"]);
    });

    it("sanitizes base name or uses fallback", () => {
      const items: QrItem[] = [
        { fileBaseName: "meu qr código", id: "1", link: "", legenda: "", dataUrl: "",  bytes: new Uint8Array() },
        { fileBaseName: "??", id: "2", link: "", legenda: "", dataUrl: "",  bytes: new Uint8Array() },
      ];
      
      const names = buildUniqueFileNames(items);
      expect(names).toEqual(["meu-qr-codigo.png", "qr-002.png"]);
    });
  });
});
