import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Basic, LongPlaceholder } from "./search-input.stories";

describe("<SearchInput />", () => {
  it("renders a text input with the default 'Search' placeholder", async () => {
    const screen = render(<Basic />);
    const input = await screen.getByPlaceholder("Search");
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAttribute("type", "text");
  });

  it("supports a custom placeholder", async () => {
    const screen = render(<LongPlaceholder />);
    const input = await screen.getByPlaceholder(
      "Search name, email, company, id...",
    );
    await expect.element(input).toBeInTheDocument();
  });
});
