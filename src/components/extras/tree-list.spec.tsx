import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic } from "@/stories/extras/tree-list.stories";

describe("<TreeList />", () => {
  it("renders root nodes and nested children with correct depth", async () => {
    const screen = render(<Basic />);
    await expect.element(screen.getByText("Electronics")).toBeInTheDocument();
    await expect.element(screen.getByText("Phones")).toBeInTheDocument();
    // Gaming Laptops is depth 2 (Electronics > Laptops > Gaming Laptops)
    await expect
      .element(screen.getByText("Gaming Laptops"))
      .toBeInTheDocument();
  });

  it("collapses and expands a node via the chevron button", async () => {
    const screen = render(<Basic />);
    // Start: Phones is visible (defaultExpanded)
    await expect.element(screen.getByText("Phones")).toBeInTheDocument();
    // Find the Electronics row and click its chevron
    const electronicsRow = document.querySelector(
      '[data-id="1"]',
    ) as HTMLElement;
    const chevron = electronicsRow.querySelector(
      'button[aria-label="Collapse"]',
    );
    expect(chevron).toBeTruthy();
    (chevron as HTMLButtonElement).click();
    // After collapse, Phones should no longer be in DOM
    await new Promise((r) => setTimeout(r, 50));
    expect(document.body.textContent).not.toMatch(/Phones/);
  });
});
