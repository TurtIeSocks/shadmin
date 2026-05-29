import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { SelectedCallout } from "@/stories/block-editor/block-editor.stories";

/**
 * `SelectedCallout` mounts a doc with one callout and programmatically
 * node-selects it on create, which activates the floating toolbar (reliable —
 * no click simulation). We assert the toolbar's Delete action removes the node.
 */
describe("BlockToolbar", () => {
  it("shows the toolbar for a selected block and deletes it", async () => {
    const screen = render(<SelectedCallout />);
    // Wait on a retrying locator (the callout's inner prose) so the node-view has
    // mounted before we snapshot the DOM — a one-shot querySelector would capture
    // null on the first frame.
    await expect.element(screen.getByText("Note")).toBeInTheDocument();
    expect(
      screen.container.querySelector('[data-block="callout"]'),
    ).not.toBeNull();
    const del = screen.getByRole("button", { name: /delete block/i });
    await del.click();
    expect(screen.container.querySelector('[data-block="callout"]')).toBeNull();
  });

  it("offers configure and duplicate actions", async () => {
    const screen = render(<SelectedCallout />);
    await expect
      .element(screen.getByRole("button", { name: /configure block/i }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: /duplicate block/i }))
      .toBeInTheDocument();
  });
});
