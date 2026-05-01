import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import App from "./App.vue";
import { mountWithI18n, setTestLocale } from "./test/mountWithI18n";
import type { QrItem } from "./types/qr";

vi.mock("./utils/download", () => ({
  downloadQrItems: vi.fn().mockResolvedValue(true),
}));

vi.mock("./utils/qr", () => ({
  createQrItem: vi.fn(),
}));

function makeQrItem(overrides: Partial<QrItem> = {}): QrItem {
  const link = overrides.link ?? "https://example.com";
  const legenda = overrides.legenda ?? "Example caption";

  return {
    id: overrides.id ?? "item-1",
    link,
    legenda,
    dataUrl: overrides.dataUrl ?? "data:image/png;base64,example",
    fileBaseName: overrides.fileBaseName ?? "example-caption",
    bytes: overrides.bytes ?? new Uint8Array([1, 2, 3]),
  };
}

function setInputFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, "files", {
    value: files,
    configurable: true,
  });
}

describe("App.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setTestLocale("en");
  });

  it("adds manual item and updates list", async () => {
    const { createQrItem } = await import("./utils/qr");
    vi.mocked(createQrItem).mockResolvedValue({
      id: "mock1",
      link: "https://test.com",
      legenda: "Test Legenda",
      dataUrl: "data:image/png;base64,...",
      fileBaseName: "mock1",
      bytes: new Uint8Array([]),
    } as QrItem);

    const wrapper = mountWithI18n(App);

    const linkInput = wrapper.find("input#manual-link");
    const legendInput = wrapper.find("input#manual-legend");

    expect(linkInput.exists()).toBe(true);
    expect(legendInput.exists()).toBe(true);

    await linkInput.setValue("test.com");
    await flushPromises();

    expect(createQrItem).toHaveBeenCalledWith("https://test.com", "", 1);

    const addButton = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Add"));
    await addButton?.trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("1 QR ready");
    expect(wrapper.text()).toContain("Test Legenda");
  });

  it("shows an error and skips QR generation for invalid manual input", async () => {
    const { createQrItem } = await import("./utils/qr");
    const wrapper = mountWithI18n(App);

    await wrapper.find("input#manual-link").setValue("bad link");
    await flushPromises();

    expect(createQrItem).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Enter a valid URL, IP or intranet path.");
  });

  it("keeps the newest manual preview when QR generation finishes out of order", async () => {
    const { createQrItem } = await import("./utils/qr");
    let resolveFirst: (item: QrItem) => void = () => {};
    const firstGeneration = new Promise<QrItem>((resolve) => {
      resolveFirst = resolve;
    });

    vi.mocked(createQrItem)
      .mockImplementationOnce(() => firstGeneration)
      .mockResolvedValueOnce(
        makeQrItem({
          id: "second",
          link: "https://second.example",
          legenda: "Second QR",
          fileBaseName: "second-qr",
        }),
      );

    const wrapper = mountWithI18n(App);
    const linkInput = wrapper.find("input#manual-link");

    await linkInput.setValue("first.example");
    await linkInput.setValue("second.example");
    await flushPromises();

    expect(wrapper.text()).toContain("Second QR");

    resolveFirst(
      makeQrItem({
        id: "first",
        link: "https://first.example",
        legenda: "First QR",
        fileBaseName: "first-qr",
      }),
    );
    await flushPromises();

    expect(wrapper.text()).toContain("Second QR");
    expect(wrapper.text()).not.toContain("First QR");
  });

  it("imports valid CSV rows and reports ignored rows", async () => {
    const { createQrItem } = await import("./utils/qr");

    vi.mocked(createQrItem).mockImplementation(async (link, legenda, index) =>
      makeQrItem({
        id: `item-${index}`,
        link,
        legenda,
        fileBaseName: `item-${index}`,
      }),
    );

    const wrapper = mountWithI18n(App);
    const csvInput = wrapper.find<HTMLInputElement>("input#csv-upload");
    const file = new File(
      ["Link,Caption\nexample.com,Example site\nbad link,Broken row"],
      "codes.csv",
      { type: "text/csv" },
    );

    setInputFiles(csvInput.element, [file]);
    await csvInput.trigger("change");
    await flushPromises();

    expect(createQrItem).toHaveBeenCalledWith("https://example.com", "Example site", 1);
    expect(wrapper.text()).toContain("1 QR loaded. 1 row ignored.");
    expect(wrapper.text()).toContain("Example site");
    expect(wrapper.text()).toContain("1 of 1");
  });

  it("rejects non-CSV files before parsing", async () => {
    const { createQrItem } = await import("./utils/qr");
    const wrapper = mountWithI18n(App);
    const csvInput = wrapper.find<HTMLInputElement>("input#csv-upload");
    const file = new File(["Link,Caption"], "codes.txt", { type: "text/plain" });

    setInputFiles(csvInput.element, [file]);
    await csvInput.trigger("change");
    await flushPromises();

    expect(createQrItem).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Select or drag a valid CSV file.");
  });

  it("navigates imported items and removes the current item", async () => {
    const { createQrItem } = await import("./utils/qr");

    vi.mocked(createQrItem).mockImplementation(async (link, legenda, index) =>
      makeQrItem({
        id: `item-${index}`,
        link,
        legenda,
        fileBaseName: `item-${index}`,
      }),
    );

    const wrapper = mountWithI18n(App);
    const csvInput = wrapper.find<HTMLInputElement>("input#csv-upload");
    const file = new File(
      ["Link,Caption\nfirst.example,First QR\nsecond.example,Second QR"],
      "codes.csv",
      { type: "text/csv" },
    );

    setInputFiles(csvInput.element, [file]);
    await csvInput.trigger("change");
    await flushPromises();

    await wrapper.find('[aria-label="Next QR"]').trigger("click");
    expect(wrapper.text()).toContain("2 of 2");
    expect(wrapper.text()).toContain("Second QR");

    await wrapper.find('[aria-label="Remove current QR"]').trigger("click");

    expect(wrapper.text()).toContain("1 of 1");
    expect(wrapper.text()).toContain("First QR");
    expect(wrapper.text()).not.toContain("Second QR");
    expect(wrapper.text()).toContain("QR removed from the list.");
  });

  it("maps canceled and failed downloads to user-visible status messages", async () => {
    const { createQrItem } = await import("./utils/qr");
    const { downloadQrItems } = await import("./utils/download");

    vi.mocked(createQrItem).mockResolvedValue(
      makeQrItem({
        link: "https://example.com",
        legenda: "Download target",
      }),
    );
    vi.mocked(downloadQrItems).mockResolvedValueOnce(false).mockRejectedValueOnce(
      new Error("disk unavailable"),
    );

    const wrapper = mountWithI18n(App);

    await wrapper.find("input#manual-link").setValue("example.com");
    await flushPromises();

    const downloadButton = () =>
      wrapper
        .findAll("button")
        .find((button) => button.text().includes("Download PNG"));

    await downloadButton()?.trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Download canceled.");

    await downloadButton()?.trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Could not save the file.");
  });
});
