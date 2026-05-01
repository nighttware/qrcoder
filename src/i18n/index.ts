import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";

export const SUPPORTED_LOCALES = ["en", "pt-BR"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = "qrcoder.locale";
const FALLBACK: SupportedLocale = "en";

function isSupported(value: string | null | undefined): value is SupportedLocale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function readStoredLocale(): SupportedLocale | null {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isSupported(stored) ? stored : null;
  } catch {
    return null;
  }
}

function detectFromNavigator(): SupportedLocale {
  const candidates: string[] = [];

  if (typeof navigator !== "undefined") {
    if (Array.isArray(navigator.languages)) {
      candidates.push(...navigator.languages);
    }
    if (navigator.language) {
      candidates.push(navigator.language);
    }
  }

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    if (lower.startsWith("pt")) {
      return "pt-BR";
    }
    if (lower.startsWith("en")) {
      return "en";
    }
  }

  return FALLBACK;
}

export function detectInitialLocale(): SupportedLocale {
  return readStoredLocale() ?? detectFromNavigator();
}

export const i18n = createI18n({
  legacy: false,
  locale: detectInitialLocale(),
  fallbackLocale: FALLBACK,
  messages: {
    en,
    "pt-BR": ptBR,
  },
});

export const STORAGE_LOCALE_KEY = STORAGE_KEY;

export function tn(key: string, count: number, named: Record<string, unknown> = {}) {
  return i18n.global.t(key, { count, ...named }, count);
}

export function t(key: string, named?: Record<string, unknown>) {
  return named ? i18n.global.t(key, named) : i18n.global.t(key);
}
