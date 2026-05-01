import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectInitialLocale, STORAGE_LOCALE_KEY } from "./index";

describe("i18n locale detection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("prefers a supported stored locale over browser language", () => {
    localStorage.setItem(STORAGE_LOCALE_KEY, "pt-BR");
    vi.stubGlobal("navigator", {
      languages: ["en-US"],
      language: "en-US",
    });

    expect(detectInitialLocale()).toBe("pt-BR");
  });

  it("ignores unsupported stored values and detects Portuguese browser locales", () => {
    localStorage.setItem(STORAGE_LOCALE_KEY, "es");
    vi.stubGlobal("navigator", {
      languages: ["pt-PT", "en-US"],
      language: "en-US",
    });

    expect(detectInitialLocale()).toBe("pt-BR");
  });

  it("falls back to English when no supported language is found", () => {
    vi.stubGlobal("navigator", {
      languages: ["es-ES"],
      language: "es-ES",
    });

    expect(detectInitialLocale()).toBe("en");
  });
});
