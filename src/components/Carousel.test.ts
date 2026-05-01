import { describe, it, expect, beforeEach } from "vitest";
import { mountWithI18n, setTestLocale } from "../test/mountWithI18n";
import Carousel from "./Carousel.vue";
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

describe("Carousel.vue", () => {
  beforeEach(() => {
    setTestLocale("en");
  });

  it("renders the empty state and disables navigation when there is no item", () => {
    const wrapper = mountWithI18n(Carousel, {
      props: {
        item: null,
        hasMultipleItems: false,
      },
    });

    expect(wrapper.text()).toContain("No QR generated");
    expect(wrapper.text()).toContain("Type a URL, IP, path or import a CSV.");
    expect(wrapper.find("img").exists()).toBe(false);

    expect(wrapper.find('[aria-label="Previous QR"]').attributes("disabled")).toBeDefined();
    expect(wrapper.find('[aria-label="Next QR"]').attributes("disabled")).toBeDefined();
  });

  it("renders QR item details with a caption-specific image description", () => {
    const item = makeItem();
    const wrapper = mountWithI18n(Carousel, {
      props: {
        item,
        hasMultipleItems: false,
      },
    });

    const image = wrapper.find("img");

    expect(image.attributes("src")).toBe(item.dataUrl);
    expect(image.attributes("alt")).toBe("QR code: Example caption");
    expect(wrapper.text()).toContain("Example caption");
    expect(wrapper.text()).toContain("https://example.com");
  });

  it("uses the file name and default alt text when the item has no caption", () => {
    const wrapper = mountWithI18n(Carousel, {
      props: {
        item: makeItem({ legenda: "", fileBaseName: "example.com" }),
        hasMultipleItems: false,
      },
    });

    expect(wrapper.find("img").attributes("alt")).toBe("Generated QR code");
    expect(wrapper.text()).toContain("example.com");
  });

  it("emits navigation events when multiple items are available", async () => {
    const wrapper = mountWithI18n(Carousel, {
      props: {
        item: makeItem(),
        hasMultipleItems: true,
      },
    });

    await wrapper.find('[aria-label="Previous QR"]').trigger("click");
    await wrapper.find('[aria-label="Next QR"]').trigger("click");

    expect(wrapper.emitted("previous")).toHaveLength(1);
    expect(wrapper.emitted("next")).toHaveLength(1);
  });
});
