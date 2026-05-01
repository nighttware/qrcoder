import { describe, it, expect } from "vitest";
import { normalizeLink, isValidQrTarget } from "./links";

describe("links util", () => {
  describe("normalizeLink", () => {
    it("returns empty string if blank", () => {
      expect(normalizeLink("   ")).toBe("");
    });

    it("keeps explicit schemes", () => {
      expect(normalizeLink("http://example.com")).toBe("http://example.com");
      expect(normalizeLink("https://example.com")).toBe("https://example.com");
      expect(normalizeLink("ftp://example.com")).toBe("ftp://example.com");
    });

    it("keeps network paths", () => {
      expect(normalizeLink("\\\\server\\share")).toBe("\\\\server\\share");
      expect(normalizeLink("//server/share")).toBe("//server/share");
      expect(normalizeLink("C:\\Users\\test")).toBe("C:\\Users\\test");
    });

    it("keeps IPv4 targets", () => {
      expect(normalizeLink("192.168.1.1")).toBe("192.168.1.1");
      expect(normalizeLink("192.168.1.1:8080/app")).toBe("192.168.1.1:8080/app");
    });

    it("prepends https to domain names", () => {
      expect(normalizeLink("example.com")).toBe("https://example.com");
      expect(normalizeLink("www.example.com/path")).toBe("https://www.example.com/path");
    });
  });

  describe("isValidQrTarget", () => {
    it("is invalid for blank or control characters", () => {
      expect(isValidQrTarget("")).toBe(false);
      expect(isValidQrTarget("   ")).toBe(false);
      expect(isValidQrTarget("test\u0000")).toBe(false);
    });

    it("is valid for network paths", () => {
      expect(isValidQrTarget("\\\\server\\share")).toBe(true);
      expect(isValidQrTarget("//server/share")).toBe(true);
      expect(isValidQrTarget("C:\\path")).toBe(true);
    });

    it("is valid for IPs", () => {
      expect(isValidQrTarget("127.0.0.1")).toBe(true);
      expect(isValidQrTarget("10.0.0.5:3000")).toBe(true);
    });

    it("is valid for URLs with scheme", () => {
      expect(isValidQrTarget("https://example.com")).toBe(true);
      expect(isValidQrTarget("http://test.com")).toBe(true);
    });

    it("is invalid for invalid URLs", () => {
      expect(isValidQrTarget("my scheme://test")).toBe(false);
    });
  });
});
