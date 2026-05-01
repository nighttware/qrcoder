import { mount, type ComponentMountingOptions } from "@vue/test-utils";
import type { Component } from "vue";
import { i18n, type SupportedLocale } from "../i18n";

export function setTestLocale(locale: SupportedLocale = "en") {
  i18n.global.locale.value = locale;
}

export function mountWithI18n<T extends Component>(
  component: T,
  options: ComponentMountingOptions<T> = {} as ComponentMountingOptions<T>,
) {
  return mount(component, {
    ...options,
    global: {
      ...(options.global ?? {}),
      plugins: [i18n, ...(options.global?.plugins ?? [])],
    },
  });
}
