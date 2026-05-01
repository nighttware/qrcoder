import { describe, it, expect, beforeEach } from "vitest";
import { mountWithI18n, setTestLocale } from "../test/mountWithI18n";
import LoadingOverlay from "./LoadingOverlay.vue";

describe("LoadingOverlay.vue", () => {
  beforeEach(() => {
    setTestLocale("en");
  });

  it("shows when visible is true", () => {
    const wrapper = mountWithI18n(LoadingOverlay, {
      props: {
        title: "Test Loading",
        description: "Test Description",
        visible: true,
        current: null,
        total: null,
      },
    });

    expect(wrapper.text()).toContain("Test Loading");
    expect(wrapper.text()).toContain("Test Description");
    expect(wrapper.isVisible()).toBe(true);
  });

  it("renders clamped progress when current and total are provided", () => {
    const wrapper = mountWithI18n(LoadingOverlay, {
      props: {
        title: "Importing",
        description: "Generating QR codes",
        visible: true,
        current: 12,
        total: 10,
      },
    });

    expect(wrapper.text()).toContain("12 of 10 processed");
    expect(wrapper.find(".bg-\\(--color-accent\\)").attributes("style")).toContain(
      "width: 100%;",
    );
  });
});
