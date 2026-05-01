import { describe, it, expect, beforeEach } from "vitest";
import { mountWithI18n, setTestLocale } from "../test/mountWithI18n";
import Preview from "./Preview.vue";
import type { QrItem } from "../types/qr";

function makeItem(overrides: Partial<QrItem> = {}): QrItem {
  return {
    id: "item-1",
    link: "https://example.com",
    legenda: "Example caption",
    dataUrl: "data:image/png;base64,example",
    bytes: new Uint8Array([1, 2, 3]),
    fileBaseName: "example-caption",
    ...overrides,
  };
}

function mountPreview(props = {}) {
  return mountWithI18n(Preview, {
    props: {
      currentIndex: 0,
      totalItems: 0,
      downloadLabel: "Download PNG",
      canDownload: false,
      isBusy: false,
      statusMessage: "",
      isGenerating: false,
      hasListItems: false,
      currentItem: null,
      hasMultipleItems: false,
      ...props,
    },
  });
}

describe("Preview.vue", () => {
  beforeEach(() => {
    setTestLocale("en");
  });

  it("renders empty preview state and disables download when nothing is ready", () => {
    const wrapper = mountPreview();
    const downloadButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Download PNG"));

    expect(wrapper.text()).toContain("No QR generated");
    expect(downloadButton?.attributes("disabled")).toBeDefined();
    expect(wrapper.find('[aria-label="Remove current QR"]').exists()).toBe(false);
  });

  it("renders the selected item count and emits preview actions", async () => {
    const wrapper = mountPreview({
      currentIndex: 1,
      totalItems: 2,
      downloadLabel: "Download ZIP",
      canDownload: true,
      hasListItems: true,
      currentItem: makeItem(),
      hasMultipleItems: true,
    });

    expect(wrapper.text()).toContain("2 of 2");
    expect(wrapper.text()).toContain("Example caption");

    const downloadButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Download ZIP"));

    await downloadButton?.trigger("click");
    await wrapper.find('[aria-label="Remove current QR"]').trigger("click");
    await wrapper.find('[aria-label="Previous QR"]').trigger("click");
    await wrapper.find('[aria-label="Next QR"]').trigger("click");

    expect(wrapper.emitted("download")).toHaveLength(1);
    expect(wrapper.emitted("removeCurrent")).toHaveLength(1);
    expect(wrapper.emitted("previous")).toHaveLength(1);
    expect(wrapper.emitted("next")).toHaveLength(1);
  });

  it("shows generation status instead of the previous status message", () => {
    const wrapper = mountPreview({
      totalItems: 1,
      downloadLabel: "Download PNG",
      canDownload: true,
      statusMessage: "PNG saved.",
      isGenerating: true,
      currentItem: makeItem(),
    });

    expect(wrapper.text()).toContain("Generating QR...");
    expect(wrapper.text()).not.toContain("PNG saved.");
  });

  it("disables download while the app is busy", () => {
    const wrapper = mountPreview({
      totalItems: 1,
      canDownload: true,
      isBusy: true,
      currentItem: makeItem(),
    });
    const downloadButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Download PNG"));

    expect(downloadButton?.attributes("disabled")).toBeDefined();
  });
});
