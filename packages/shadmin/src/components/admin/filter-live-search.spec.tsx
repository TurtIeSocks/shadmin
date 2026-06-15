import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, CustomSource } from "./filter-live-search.stories";

describe("<FilterLiveSearch />", () => {
  it("renders a search input with the default placeholder", async () => {
    const screen = render(<Basic />);
    await expect
      .poll(() => screen.getByPlaceholder("Search").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });

  it("renders the custom placeholder when provided", async () => {
    const screen = render(<CustomSource />);
    await expect
      .poll(() => screen.getByPlaceholder("Search title").elements().length, {
        timeout: 5000,
      })
      .toBeGreaterThan(0);
  });

  it("accepts user input", async () => {
    const screen = render(<Basic />);
    const input = screen.getByPlaceholder("Search");
    await input.fill("wilde");
    await expect.element(input).toHaveValue("wilde");
  });
});
