import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WithCallout } from "../block-editor.stories";

/**
 * The gutter's ⊕ button lives inside the drag-handle extension's portal, which
 * only renders on real pointer hover over a block — unreliable to drive under
 * the browser provider. We instead verify the behavior the ⊕ button performs:
 * opening the catalog picker through `editor.storage.slashCommand.open()` (the
 * exact channel `onAdd` calls). The `WithCallout` story exposes a button wired
 * to that same channel.
 *
 * Drag reorder itself is ProseMirror-native via `@tiptap/extension-drag-handle-react`
 * (verified wired by the gutter rendering `<DragHandle editor={editor}>`); a real
 * drag gesture is not simulated here.
 */
describe("BlockGutter", () => {
  it("opens the catalog picker via the add-block channel", async () => {
    const screen = render(<WithCallout />);
    await screen.getByRole("button", { name: /open picker/i }).click();
    await expect
      .element(screen.getByPlaceholder(/search blocks/i))
      .toBeInTheDocument();
  });

  it("inserts a block at the caret when none is targeted (no range)", async () => {
    const screen = render(<WithCallout />);
    await screen.getByRole("button", { name: /open picker/i }).click();
    await screen.getByText("Callout").click();
    await expect
      .element(
        screen.container.querySelector('[data-block="callout"]') as HTMLElement,
      )
      .toBeInTheDocument();
  });
});
