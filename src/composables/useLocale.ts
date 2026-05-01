import { computed, markRaw, type Component } from "vue";
import { useI18n } from "vue-i18n";
import {
  i18n,
  STORAGE_LOCALE_KEY,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../i18n";
import FlagBR from "../components/icons/FlagBR.vue";
import FlagUS from "../components/icons/FlagUS.vue";

export interface LocaleOption {
  code: SupportedLocale;
  flag: Component;
}

export const localeOptions: LocaleOption[] = [
  { code: "en", flag: markRaw(FlagUS) },
  { code: "pt-BR", flag: markRaw(FlagBR) },
];

function persistLocale(code: SupportedLocale) {
  try {
    globalThis.localStorage?.setItem(STORAGE_LOCALE_KEY, code);
  } catch {
    /* localStorage unavailable — ignore */
  }
}

function applyDocumentLang(code: SupportedLocale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = code;
  }
}

applyDocumentLang(i18n.global.locale.value as SupportedLocale);

export function useLocale() {
  const { locale, t } = useI18n();

  const currentLocale = computed<SupportedLocale>(
    () => locale.value as SupportedLocale,
  );

  function setLocale(code: SupportedLocale) {
    if (!SUPPORTED_LOCALES.includes(code)) return;
    locale.value = code;
    persistLocale(code);
    applyDocumentLang(code);
  }

  const currentOption = computed<LocaleOption>(
    () =>
      localeOptions.find((option) => option.code === currentLocale.value) ??
      localeOptions[0],
  );

  function localeName(code: SupportedLocale) {
    return t(`languageSwitcher.options.${code}`);
  }

  return {
    currentLocale,
    currentOption,
    setLocale,
    localeOptions,
    localeName,
  };
}
