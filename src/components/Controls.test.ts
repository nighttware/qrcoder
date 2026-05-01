import { describe, it, expect, beforeEach } from "vitest";
import { mountWithI18n, setTestLocale } from "../test/mountWithI18n";
import Controls from "./Controls.vue";

function mountControls(props = {}) {
  return mountWithI18n(Controls, {
    props: {
      manualLink: "",
      manualLegend: "",
      manualError: "",
      csvSummary: "",
      qrCount: 0,
      canAdd: true,
      canClear: true,
      isDraftGenerating: false,
      isBusy: false,
      ...props,
    },
  });
}

function setInputFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, "files", {
    value: files,
    configurable: true,
  });
}

describe("Controls.vue", () => {
  beforeEach(() => {
    setTestLocale("en");
  });

  it("emits manual field updates and submit actions", async () => {
    const wrapper = mountControls();

    await wrapper.find("#manual-link").setValue("example.com");
    await wrapper.find("#manual-legend").setValue("Example caption");
    await wrapper.find("form").trigger("submit");

    expect(wrapper.emitted("update:manualLink")).toEqual([["example.com"]]);
    expect(wrapper.emitted("update:manualLegend")).toEqual([["Example caption"]]);
    expect(wrapper.emitted("addManual")).toHaveLength(1);
  });

  it("shows validation and import summaries from props", () => {
    const wrapper = mountControls({
      manualError: "Enter a valid URL, IP or intranet path.",
      csvSummary: "1 QR loaded.",
      qrCount: 1,
    });

    expect(wrapper.text()).toContain("Enter a valid URL, IP or intranet path.");
    expect(wrapper.text()).toContain("1 QR loaded.");
    expect(wrapper.text()).toContain("1 QR ready");
  });

  it("disables add and upload controls while generation is busy", () => {
    const wrapper = mountControls({
      canAdd: true,
      isDraftGenerating: true,
      isBusy: true,
    });

    const addButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Add"));
    const fileInput = wrapper.find<HTMLInputElement>("#csv-upload");

    expect(addButton?.attributes("disabled")).toBeDefined();
    expect(fileInput.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Wait for the current process to finish.");
  });

  it("emits selected CSV files and ignores file input changes while busy", async () => {
    const file = new File(["Link,Caption\nhttps://example.com,Example"], "codes.csv", {
      type: "text/csv",
    });
    const wrapper = mountControls();
    const fileInput = wrapper.find<HTMLInputElement>("#csv-upload");

    setInputFiles(fileInput.element, [file]);
    await fileInput.trigger("change");

    expect(wrapper.emitted("csvUpload")).toEqual([[file]]);

    const busyWrapper = mountControls({ isBusy: true });
    const busyInput = busyWrapper.find<HTMLInputElement>("#csv-upload");

    setInputFiles(busyInput.element, [file]);
    await busyInput.trigger("change");

    expect(busyWrapper.emitted("csvUpload")).toBeUndefined();
  });

  it("chooses a CSV file from a drop payload and blocks drops while busy", async () => {
    const textFile = new File(["not csv"], "notes.txt", { type: "text/plain" });
    const csvFile = new File(["Link,Caption"], "codes.csv", { type: "text/csv" });
    const wrapper = mountControls();
    const dropZone = wrapper.find(".border-t");

    await dropZone.trigger("drop", {
      dataTransfer: {
        files: [textFile, csvFile],
      },
    });

    expect(wrapper.emitted("csvUpload")).toEqual([[csvFile]]);

    const busyWrapper = mountControls({ isBusy: true });

    await busyWrapper.find(".border-t").trigger("drop", {
      dataTransfer: {
        files: [csvFile],
      },
    });

    expect(busyWrapper.emitted("csvUpload")).toBeUndefined();
  });

  it("marks file drag state and sets the drag operation according to busy state", async () => {
    const wrapper = mountControls();
    const dropZone = wrapper.find(".border-t");
    const dataTransfer = { dropEffect: "none" };

    await dropZone.trigger("dragenter", {
      dataTransfer: {
        types: ["Files"],
      },
    });
    await dropZone.trigger("dragover", { dataTransfer });

    expect(dataTransfer.dropEffect).toBe("copy");

    const busyWrapper = mountControls({ isBusy: true });
    const busyDataTransfer = { dropEffect: "copy" };

    await busyWrapper.find(".border-t").trigger("dragover", {
      dataTransfer: busyDataTransfer,
    });

    expect(busyDataTransfer.dropEffect).toBe("none");
  });
});
