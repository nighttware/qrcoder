import { describe, it, expect, beforeEach } from "vitest";
import { mountWithI18n, setTestLocale } from "../test/mountWithI18n";
import AppHeader from "./AppHeader.vue";

describe("AppHeader.vue", () => {
  beforeEach(() => {
    setTestLocale("en");
  });

  it("renders correctly", () => {
    const wrapper = mountWithI18n(AppHeader);
    expect(wrapper.text()).toContain("QR Coder");
  });
});
