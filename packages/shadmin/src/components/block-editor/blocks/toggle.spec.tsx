import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ToggleStory } from "./blocks-2.stories";

describe("toggle block", () => {
  it("renders the summary and its inner prose", async () => {
    const screen = render(<ToggleStory />);
    await expect.element(screen.getByText("More details")).toBeInTheDocument();
    const toggle = screen.container.querySelector(
      '[data-block="toggle"]',
    ) as HTMLElement;
    expect(toggle).not.toBeNull();
    await expect.element(screen.getByText("Hidden body")).toBeInTheDocument();
  });
});
