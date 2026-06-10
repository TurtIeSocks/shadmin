import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic } from "./filter-list-section.stories";

describe("<FilterListSection />", () => {
  it("renders the section's label", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByText("Title").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });

  it("renders the section's children alongside the label", async () => {
    const screen = render(<Basic />);
    // The story renders a Category FilterList alongside the Title section.
    await expect
      .poll(() => screen.getByText("Category").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });
});
