import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { CalloutStory } from "@/stories/block-editor/blocks.stories";

describe("callout block", () => {
  it("renders the callout with its inner prose and variant class", async () => {
    const screen = render(<CalloutStory />);
    // Wait on a retrying locator (the callout's inner prose) so the React
    // node-view has mounted before we snapshot the DOM — a one-shot
    // querySelector would capture null on the first frame.
    await expect.element(screen.getByText("Note text")).toBeInTheDocument();

    const callout = screen.container.querySelector(
      '[data-block="callout"]',
    ) as HTMLElement;
    expect(callout).not.toBeNull();
    expect(callout).toHaveTextContent("Note text");

    // `data-variant` is carried by the inner div rendered by CalloutRender,
    // not the node-view wrapper, so query the element that actually has it.
    const variantEl = screen.container.querySelector('[data-variant="warning"]');
    expect(variantEl).not.toBeNull();
    expect(callout.contains(variantEl)).toBe(true);
  });
});
