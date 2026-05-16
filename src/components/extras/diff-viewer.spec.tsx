import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { SideBySide, Inline } from "@/stories/extras/diff-viewer.stories";

describe("<DiffViewer />", () => {
  it("renders side-by-side mode with correct diff statuses", async () => {
    const screen = render(<SideBySide />);
    // "name" changed
    const nameRow = document.querySelector(
      '[data-field="name"]',
    ) as HTMLElement | null;
    expect(nameRow?.getAttribute("data-status")).toBe("changed");
    // "stock" unchanged
    const stockRow = document.querySelector('[data-field="stock"]');
    expect(stockRow?.getAttribute("data-status")).toBe("unchanged");
    // "sku" removed (present in before, missing in after)
    const skuRow = document.querySelector('[data-field="sku"]');
    expect(skuRow?.getAttribute("data-status")).toBe("removed");
    // "category" added (missing in before)
    const catRow = document.querySelector('[data-field="category"]');
    expect(catRow?.getAttribute("data-status")).toBe("added");
    await expect
      .element(screen.getByText(/notebook pro/i))
      .toBeInTheDocument();
  });

  it("renders inline mode with strikethrough and underline cues", async () => {
    render(<Inline />);
    const root = document.querySelector(
      '[data-slot="diff-viewer"]',
    ) as HTMLElement | null;
    expect(root?.getAttribute("data-mode")).toBe("inline");
    // Check at least one removed and one added field render correctly
    const skuRow = document.querySelector('[data-field="sku"]');
    expect(skuRow?.querySelector(".line-through")).toBeTruthy();
    const catRow = document.querySelector('[data-field="category"]');
    expect(catRow?.querySelector(".underline")).toBeTruthy();
  });

  it("renders the correct mode attribute for side-by-side", async () => {
    render(<SideBySide />);
    const root = document.querySelector('[data-slot="diff-viewer"]');
    expect(root?.getAttribute("data-mode")).toBe("side-by-side");
  });

  it("shows arrow icons in side-by-side mode", async () => {
    const screen = render(<SideBySide />);
    // The header and each row have an arrow; there should be multiple SVGs
    const container = screen.getByText("Before").element().closest(
      '[data-slot="diff-viewer"]',
    );
    const svgs = container?.querySelectorAll("svg");
    expect(svgs?.length).toBeGreaterThan(0);
  });
});
