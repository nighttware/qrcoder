import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mountWithI18n, setTestLocale } from "../test/mountWithI18n";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import { i18n, STORAGE_LOCALE_KEY } from "../i18n";

describe("LanguageSwitcher.vue", () => {
  beforeEach(() => {
    localStorage.clear();
    setTestLocale("en");
  });

  afterEach(() => {
    localStorage.clear();
    setTestLocale("en");
  });

  it("renders the current locale label", () => {
    const wrapper = mountWithI18n(LanguageSwitcher);
    expect(wrapper.text()).toContain("English");
  });

  it("toggles the listbox open and closed", async () => {
    const wrapper = mountWithI18n(LanguageSwitcher, { attachTo: document.body });

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);

    await wrapper.find("button").trigger("click");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
    expect(wrapper.find('[role="listbox"]').text()).toContain("Português");
    expect(wrapper.find('[role="listbox"]').text()).toContain("English");

    await wrapper.find("button").trigger("click");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it("changes locale and persists to localStorage when an option is chosen", async () => {
    const wrapper = mountWithI18n(LanguageSwitcher, { attachTo: document.body });

    await wrapper.find("button").trigger("click");
    const ptOption = wrapper
      .findAll('[role="option"]')
      .find((o) => o.text().includes("Português"));
    expect(ptOption).toBeTruthy();

    await ptOption!.trigger("click");

    expect(i18n.global.locale.value).toBe("pt-BR");
    expect(localStorage.getItem(STORAGE_LOCALE_KEY)).toBe("pt-BR");
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
