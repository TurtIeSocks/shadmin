import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ImageStory, ImageEmptyStory } from "./blocks-2.stories";

describe("image block", () => {
  it("renders an img with the src and alt at the configured width", async () => {
    const screen = render(<ImageStory />);
    const img = screen.container.querySelector(
      '[data-block="image"] img',
    ) as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute("alt")).toBe("A red dot");
    expect(img.style.width).toBe("50%");
  });

  it("shows an empty state when no src is set", async () => {
    const screen = render(<ImageEmptyStory />);
    await expect
      .element(
        screen.container.querySelector('[data-block="image"]') as HTMLElement,
      )
      .toHaveTextContent(/add an image/i);
  });
});
